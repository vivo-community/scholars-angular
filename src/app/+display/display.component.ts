import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router, NavigationStart } from '@angular/router';
import { MetaDefinition } from '@angular/platform-browser';

import { Store, select } from '@ngrx/store';

import { Observable, Subscription, combineLatest, scheduled, Observer } from 'rxjs';
import { asap } from 'rxjs/internal/scheduler/asap';
import { filter, tap, map, mergeMap, take } from 'rxjs/operators';

import { AppState } from '../core/store';

import { DiscoveryView, DisplayView, DisplayTabView, DisplayTabSectionView, LazyReference, Filter } from '../core/model/view';

import { WindowDimensions } from '../core/store/layout/layout.reducer';

import { selectWindowDimensions } from '../core/store/layout';
import { SolrDocument } from '../core/model/discovery';
import { Side, Subsection } from '../core/model/view/display-view';

import { selectResourceById, selectDefaultDiscoveryView, selectDisplayViewByTypes, selectResourceIsLoading, selectAllResources, selectResourceIsDereferencing } from '../core/store/sdr';

import * as fromSdr from '../core/store/sdr/sdr.actions';
import * as fromMetadata from '../core/store/metadata/metadata.actions';

const hasDataAfterFilter = (section: DisplayTabSectionView, document: SolrDocument): boolean => {
    const filteredSubsections = section.subsections.filter((subsection: Subsection) => subsection.filters.length);
    for (const filteredSubsection of filteredSubsections) {
        // tslint:disable-next-line: no-shadowed-variable
        return filteredSubsection.filters.filter((filter: Filter) => {
            return document[filteredSubsection.field].filter((resource: any) => {
                const value = resource[filter.field];
                return Array.isArray(value) ? value.indexOf(filter.value) >= 0 : value === filter.value;
            }).length > 0;
        }).length > 0;
    }
    return true;
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
    return sections.filter((section: DisplayTabSectionView) => !section.hidden && hasRequiredFields(section.requiredFields, document) && hasDataAfterFilter(section, document));
};

@Component({
    selector: 'scholars-display',
    templateUrl: 'display.component.html',
    styleUrls: ['display.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayComponent implements OnDestroy, OnInit {

    public windowDimensions: Observable<WindowDimensions>;

    public displayView: Observable<DisplayView>;

    public discoveryView: Observable<DiscoveryView>;

    public document: Observable<SolrDocument>;

    private subscriptions: Subscription[];

    constructor(
        private store: Store<AppState>,
        private router: Router,
        private route: ActivatedRoute,
        private changeDetRef: ChangeDetectorRef
    ) {
        this.subscriptions = [];
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
    }

    ngOnInit() {
        this.windowDimensions = this.store.pipe(select(selectWindowDimensions));
        this.subscriptions.push(this.router.events.pipe(
            filter(event => event instanceof NavigationStart)
        ).subscribe(() => {
            this.changeDetRef.markForCheck();
        }));
        this.discoveryView = this.store.pipe(
            select(selectDefaultDiscoveryView),
            filter((view: DiscoveryView) => view !== undefined)
        );
        this.subscriptions.push(this.route.params.subscribe((params: Params) => {
            if (params.collection && params.id) {
                this.store.dispatch(new fromSdr.GetOneResourceAction(params.collection, { id: params.id }));
                this.document = this.store.pipe(
                    select(selectResourceById(params.collection, params.id)),
                    filter((document: SolrDocument) => document !== undefined),
                    take(1),
                    mergeMap((document: SolrDocument) => {

                        this.store.dispatch(new fromSdr.FindByTypesInResourceAction('displayViews', {
                            types: document.type
                        }));

                        this.displayView = this.store.pipe(
                            select(selectDisplayViewByTypes(document.type)),
                            filter((displayView: DisplayView) => displayView !== undefined),
                            mergeMap((displayView: DisplayView) => {

                                return combineLatest([scheduled([displayView], asap), new Observable((observer: Observer<boolean>) => {

                                    const dereference = (lazyReference: LazyReference): Promise<void> => {
                                        return new Promise((resolve, reject) => {
                                            this.store.dispatch(new fromSdr.FetchLazyReferenceAction(params.collection, {
                                                document,
                                                collection: lazyReference.collection,
                                                field: lazyReference.field
                                            }));
                                            this.subscriptions.push(this.store.pipe(
                                                select(selectResourceIsDereferencing(params.collection)),
                                                filter((dereferencing: boolean) => !dereferencing)
                                            ).subscribe(() => {
                                                resolve();
                                            }));
                                        });
                                    };

                                    const lazyReferences: LazyReference[] = [];

                                    displayView.tabs.filter((tab: DisplayTabView) => !tab.hidden).forEach((tab: DisplayTabView) => {
                                        tab.sections.filter((section: DisplayTabSectionView) => !section.hidden).forEach((section: DisplayTabSectionView) => {
                                            section.lazyReferences.filter((lr: LazyReference) => document[lr.field] !== undefined && !lazyReferences.find((r) => r.field === lr.field)).forEach((lazyReference: LazyReference) => {
                                                lazyReferences.push(lazyReference);
                                            });
                                        });
                                    });

                                    lazyReferences.reduce((previousPromise, nextlazyReference) => previousPromise.then(() => dereference(nextlazyReference)), Promise.resolve()).then(() => {
                                        observer.next(true);
                                        observer.complete();
                                    });

                                    if (this.route.children.length === 0) {
                                        let tabName = 'View All';
                                        if (displayView.name !== 'People') {
                                            for (const tab of this.getTabsToShow(displayView.tabs, document)) {
                                                if (!tab.hidden) {
                                                    tabName = tab.name;
                                                    break;
                                                }
                                            }
                                        }
                                        this.router.navigate([displayView.name, tabName], {
                                            relativeTo: this.route,
                                            replaceUrl: true
                                        });
                                    }

                                    this.store.dispatch(new fromMetadata.AddMetadataTagsAction({
                                        tags: this.buildDisplayMetaTags(displayView, document)
                                    }));

                                    const tabCount = displayView.tabs.length - 1;

                                    if (displayView.tabs[tabCount].name === 'View All') {
                                        displayView.tabs.splice(tabCount, 1);
                                    }

                                    const viewAllTabSections = [];

                                    const viewAllTab: DisplayTabView = {
                                        name: 'View All',
                                        hidden: false,
                                        sections: viewAllTabSections
                                    };

                                    this.getTabsToShow(displayView.tabs, document).forEach((tab: DisplayTabView) => {
                                        this.getSectionsToShow(tab.sections, document).forEach((section: DisplayTabSectionView) => {
                                            viewAllTabSections.push(section);
                                        });
                                    });

                                    displayView.tabs.push(viewAllTab);
                                })]);
                            }),
                            filter(([displayView, isReady]) => isReady),
                            map(([displayView, isReady]) => displayView)
                        );
                        return combineLatest([scheduled([document], asap), this.displayView]);
                    }),
                    filter(([document, displayView]) => displayView !== undefined),
                    map(([document, displayView]) => document)
                );
            }
        }));
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
                    name: name, content: metaTemplateFunction(document)
                });
            }
        }
        return metaTags;
    }

}
