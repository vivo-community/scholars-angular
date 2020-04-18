import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router, ActivationStart, RouterOutlet } from '@angular/router';
import { MetaDefinition } from '@angular/platform-browser';

import { Store, select } from '@ngrx/store';

import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { filter, take, switchMap, tap } from 'rxjs/operators';

import { AppState } from '../core/store';

import { DiscoveryView, DisplayView, DisplayTabView, DisplayTabSectionView, Filter } from '../core/model/view';

import { WindowDimensions } from '../core/store/layout/layout.reducer';

import { fadeIn } from '../shared/utilities/animation.utility';

import { selectWindowDimensions } from '../core/store/layout';
import { SolrDocument } from '../core/model/discovery';
import { Side, Subsection } from '../core/model/view/display-view';

import { selectResourceById, selectDiscoveryViewByClass, selectDisplayViewByTypes, selectResourceIsDereferencing, selectResourceIsLoading } from '../core/store/sdr';

import * as fromSdr from '../core/store/sdr/sdr.actions';
import * as fromMetadata from '../core/store/metadata/metadata.actions';

const hasDataAfterFilter = (fltr: Filter, obj: any): boolean => {
  return Array.isArray(obj[fltr.field]) ? obj[fltr.field].indexOf(fltr.value) >= 0 : obj[fltr.field] === fltr.value;
};

const hasDataAfterFilters = (filters: Filter[], prop: any): boolean => {
  if (Array.isArray(prop)) {
    return prop.filter((obj) => {
      for (const fltr of filters) {
        if (hasDataAfterFilter(fltr, obj)) {
          return true;
        }
      }
      return false;
    }).length > 0;
  } else {
    for (const fltr of filters) {
      if (hasDataAfterFilter(fltr, prop)) {
        return true;
      }
    }
    return false;
  }
};

const hasDataAfterSubsectionFilters = (subsection: Subsection, prop: any): boolean => {
  return subsection.filters.length === 0 || hasDataAfterFilters(subsection.filters, prop);
};

const hasDataAfterSectionFilters = (section: DisplayTabSectionView, document: SolrDocument): boolean => {
  return (section.filters.length === 0 || hasDataAfterFilters(section.filters, document[section.field])) && (section.subsections.length === 0 || section.subsections.filter((subsection: Subsection) => {
    return hasDataAfterSubsectionFilters(subsection, document[subsection.field]);
  }).length > 0);
};

const hasRequiredFields = (requiredFields: string[], document: SolrDocument): boolean => {
  for (const requiredField of requiredFields) {
    if (document[requiredField] === undefined) {
      return false;
    }
  }
  return true;
};

export const sectionsToShow = (sections: DisplayTabSectionView[], document: SolrDocument): DisplayTabSectionView[] => {
  return sections.filter((section: DisplayTabSectionView) => {
    return !section.hidden && hasRequiredFields(section.requiredFields.concat([section.field]), document) && hasDataAfterSectionFilters(section, document);
  });
};

@Component({
  selector: 'scholars-display',
  templateUrl: 'display.component.html',
  styleUrls: ['display.component.scss'],
  animations: [fadeIn],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayComponent implements OnDestroy, OnInit {

  @ViewChild(RouterOutlet) outlet: RouterOutlet;

  public windowDimensions: Observable<WindowDimensions>;

  public displayView: Observable<DisplayView>;

  public discoveryView: Observable<DiscoveryView>;

  public document: Observable<SolrDocument>;

  public ready: Observable<boolean>;

  private readySubject: BehaviorSubject<boolean>;

  private subscriptions: Subscription[];

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.subscriptions = [];
    this.readySubject = new BehaviorSubject<boolean>(false);
    this.ready = this.readySubject.asObservable();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  ngOnInit() {

    this.router.events.subscribe(e => {
      if (e instanceof ActivationStart) {
        if (this.outlet) {
          this.outlet.deactivate();
        }
      }
    });

    this.windowDimensions = this.store.pipe(select(selectWindowDimensions));

    this.subscriptions.push(
      this.route.params.subscribe((params: Params) => {
        if (params.id) {
          this.store.dispatch(new fromSdr.GetOneResourceAction('individual', { id: params.id }));

          // listen to document changes
          this.document = this.store.pipe(
            select(selectResourceById('individual', params.id)),
            filter((document: SolrDocument) => document !== undefined)
          );

          // one first defined document, get discovery view
          this.discoveryView = this.store.pipe(
            select(selectResourceById('individual', params.id)),
            filter((document: SolrDocument) => document !== undefined),
            take(1),
            switchMap((document: SolrDocument) => {
              return this.store.pipe(
                select(selectDiscoveryViewByClass(document.class)),
                filter((view: DiscoveryView) => view !== undefined)
              );
            })
          );

          // listen to document changes, updating display view tabs
          this.displayView = this.store.pipe(
            select(selectResourceById('individual', params.id)),
            filter((document: SolrDocument) => document !== undefined),
            switchMap((document: SolrDocument) => {

              return this.store.pipe(
                select(selectDisplayViewByTypes(document.type)),
                filter((displayView: DisplayView) => displayView !== undefined),
                tap((displayView: DisplayView) => {
                  if (this.route.children.length === 0) {
                    let tabName;

                    if (displayView.name !== 'Persons' && displayView.name !== 'Organizations') {
                      for (const tab of this.getTabsToShow(displayView.tabs, document)) {
                        if (tabName === undefined) {
                          tabName = tab.name;
                          break;
                        }
                      }
                    } else {
                      tabName = 'View All';
                    }

                    this.router.navigate([displayView.name, tabName], {
                      relativeTo: this.route,
                      replaceUrl: true,
                    });
                  }

                  this.store.dispatch(
                    new fromMetadata.AddMetadataTagsAction({
                      tags: this.buildDisplayMetaTags(displayView, document),
                    })
                  );

                  const tabCount = displayView.tabs.length - 1;

                  if (displayView.tabs[tabCount].name === 'View All') {
                    displayView.tabs.splice(tabCount, 1);
                  }

                  const viewAllTabSections = [];

                  const viewAllTab: DisplayTabView = {
                    name: 'View All',
                    hidden: false,
                    sections: viewAllTabSections,
                  };

                  this.getTabsToShow(displayView.tabs, document).forEach((tab: DisplayTabView) => {
                    this.getSectionsToShow(tab.sections, document).forEach((section: DisplayTabSectionView) => {
                      viewAllTabSections.push(section);
                    });
                  });

                  displayView.tabs.push(viewAllTab);
                })
              );
            })
          );

          // subscribe to first defined document to find display view
          this.subscriptions.push(this.store.pipe(
            select(selectResourceById('individual', params.id)),
            filter((document: SolrDocument) => document !== undefined),
            take(1),
            switchMap((document: SolrDocument) => {

              this.store.dispatch(
                new fromSdr.FindByTypesInResourceAction('displayViews', {
                  types: document.type,
                })
              );

              // subscribe to first defined display view to lazily fetch references
              return this.store.pipe(
                select(selectDisplayViewByTypes(document.type)),
                filter((displayView: DisplayView) => displayView !== undefined),
                take(1),
                tap((displayView: DisplayView) => {

                  const dereference = (lazyReference: string): Promise<void> => {
                    return new Promise((resolve, reject) => {
                      this.store.dispatch(
                        new fromSdr.FetchLazyReferenceAction('individual', {
                          document,
                          field: lazyReference,
                        })
                      );
                      this.subscriptions.push(
                        this.store.pipe(
                          select(selectResourceIsDereferencing('individual')),
                          filter((dereferencing: boolean) => !dereferencing)
                        ).subscribe(() => resolve())
                      );
                    });
                  };

                  const lazyReferences: string[] = [];

                  displayView.tabs
                    .filter((tab: DisplayTabView) => !tab.hidden)
                    .forEach((tab: DisplayTabView) => {
                      tab.sections
                        .filter((section: DisplayTabSectionView) => !section.hidden)
                        .forEach((section: DisplayTabSectionView) => {
                          section.lazyReferences
                            .filter((lr: string) => document[lr] !== undefined && !lazyReferences.find((r) => r === lr))
                            .forEach((lazyReference: string) => {
                              lazyReferences.push(lazyReference);
                            });
                        });
                    });

                  // lazily fetch references sequentially
                  lazyReferences.reduce((previousPromise, nextlazyReference) => previousPromise.then(() => dereference(nextlazyReference)), Promise.resolve()).then(() => {
                    this.readySubject.next(true);
                  });

                })
              );
            })
          ).subscribe());
        }
      })
    );
  }

  public getDisplayViewTabRoute(displayView: DisplayView, tab: DisplayTabView): string[] {
    return [displayView.name, tab.name];
  }

  public showMainContent(displayView: DisplayView): boolean {
    return displayView.mainContentTemplate && displayView.mainContentTemplate.length > 0;
  }

  public showLeftScan(displayView: DisplayView): boolean {
    return displayView.leftScanTemplate && displayView.leftScanTemplate.length > 0;
  }

  public showRightScan(displayView: DisplayView): boolean {
    return displayView.rightScanTemplate && displayView.rightScanTemplate.length > 0;
  }

  public showAsideLeft(displayView: DisplayView): boolean {
    return this.showAside(displayView) && displayView.asideLocation === Side.LEFT;
  }

  public showAsideRight(displayView: DisplayView): boolean {
    return this.showAside(displayView) && displayView.asideLocation === Side.RIGHT;
  }

  public showAside(displayView: DisplayView): boolean {
    return displayView.asideTemplate && displayView.asideTemplate.length > 0;
  }

  public getMainContentColSize(displayView: DisplayView): number {
    let colSize = 12;
    if (this.showLeftScan(displayView)) {
      colSize -= 3;
    }
    if (this.showRightScan(displayView)) {
      colSize -= 3;
    }
    return colSize;
  }

  public getLeftScanColSize(displayView: DisplayView): number {
    return 3;
  }

  public getRightScanColSize(displayView: DisplayView): number {
    return 3;
  }

  public getTabsToShow(tabs: DisplayTabView[], document: SolrDocument): DisplayTabView[] {
    return tabs.filter((tab: DisplayTabView) => !tab.hidden && this.getSectionsToShow(tab.sections, document).length > 0);
  }

  public getSectionsToShow(sections: DisplayTabSectionView[], document: SolrDocument): DisplayTabSectionView[] {
    return sectionsToShow(sections, document);
  }

  public isMobile(windowDimensions: WindowDimensions): boolean {
    return windowDimensions.width < 768;
  }

  private buildDisplayMetaTags(displayView: DisplayView, document: SolrDocument): MetaDefinition[] {
    const metaTags: MetaDefinition[] = [];
    for (const name in displayView.metaTemplateFunctions) {
      if (displayView.metaTemplateFunctions.hasOwnProperty(name)) {
        const metaTemplateFunction = displayView.metaTemplateFunctions[name];
        metaTags.push({
          name,
          content: metaTemplateFunction(document),
        });
      }
    }
    return metaTags;
  }

}
