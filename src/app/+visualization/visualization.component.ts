import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { filter, Observable, switchMap, take } from 'rxjs';
import { SolrDocument } from '../core/model/discovery';
import { DiscoveryView } from '../core/model/view';
import { AppState } from '../core/store';

import { selectDiscoveryViewByClass, selectResourceById } from '../core/store/sdr';
import { fadeIn } from '../shared/utilities/animation.utility';

import * as fromSdr from '../core/store/sdr/sdr.actions';

@Component({
  selector: 'scholars-visualization',
  templateUrl: 'visualization.component.html',
  styleUrls: ['visualization.component.scss'],
  animations: [fadeIn],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizationComponent implements OnInit {

  public discoveryView: Observable<DiscoveryView>;

  public document: Observable<SolrDocument>;

  constructor(private store: Store<AppState>, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.pipe(take(1)).subscribe((params: Params) => {
      if (params.id) {

        this.store.dispatch(new fromSdr.GetOneResourceAction('individual', { id: params.id }));

        // listen to document changes
        this.document = this.store.pipe(
          select(selectResourceById('individual', params.id)),
          filter((document: SolrDocument) => document !== undefined)
        );

        // on first defined document, get discovery view
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
      }
    });
  }

}
