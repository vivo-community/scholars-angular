import { Component, OnInit, OnDestroy } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';

import { Observable, Subscription, combineLatest } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';

import { DisplayTabView, DisplayTabSectionView, DisplayView } from '../../core/model/view';
import { SolrDocument } from '../../core/model/discovery';

import { AppState } from '../../core/store';

import { selectResourceById, selectDisplayViewByTypes } from '../../core/store/sdr';
import { sectionsToShow } from '../display.component';

@Component({
  selector: 'scholars-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
})
export class TabComponent implements OnDestroy, OnInit {

  public tab: Observable<DisplayTabView>;

  public document: Observable<SolrDocument>;

  public display: string;

  private subscriptions: Subscription[];

  constructor(private store: Store<AppState>, private route: ActivatedRoute) {
    this.subscriptions = [];
  }

  ngOnInit() {
    this.subscriptions.push(
      combineLatest([this.route.parent.params, this.route.params]).subscribe((params: Params[]) => {
        if (params[0].id && params[1].view && params[1].tab) {
          this.document = this.store.pipe(select(selectResourceById('individual', params[0].id)));

          // listen to document changes to get updated display view
          this.tab = this.store.pipe(
            select(selectResourceById('individual', params[0].id)),
            filter((document: SolrDocument) => document !== undefined),
            switchMap((document: SolrDocument) => {

              // map tab from latest display view for document type
              return this.store.pipe(
                select(selectDisplayViewByTypes(document.type)),
                filter((displayView: DisplayView) => displayView !== undefined),
                map((displayView: DisplayView) => {
                  let tab: DisplayTabView;
                  for (const i in displayView.tabs) {
                    if (displayView.tabs.hasOwnProperty(i)) {
                      if (displayView.tabs[i].name === params[1].tab) {
                        tab = displayView.tabs[i];
                        break;
                      } else if (displayView.tabs[i].name === 'View All') {
                        tab = displayView.tabs[i];
                      }
                    }
                  }
                  return tab;
                })
              );
            })
          );

          this.display = params[1].view;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  public getSectionsToShow(tab: DisplayTabView, document: SolrDocument): DisplayTabSectionView[] {
    return sectionsToShow(tab.sections, document);
  }

}
