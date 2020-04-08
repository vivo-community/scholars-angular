import { Component, OnInit } from '@angular/core';
import { Store, select, Action } from '@ngrx/store';

import { Observable } from 'rxjs';

import { AppState } from '../../core/store';
import { SidebarMenu, SidebarItem } from '../../core/model/sidebar';

import { selectIsSidebarCollapsed } from '../../core/store/layout';
import { selectMenu } from '../../core/store/sidebar';
import { selectResourceIsLoading } from '../../core/store/sdr';

import { fadeIn, expandCollapse } from '../utilities/animation.utility';

import * as fromRouter from '../../core/store/router/router.actions';
import * as fromSidebar from '../../core/store/sidebar/sidebar.actions';

@Component({
  selector: 'scholars-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.scss'],
  animations: [fadeIn, expandCollapse],
})
export class SidebarComponent implements OnInit {
  public isSidebarCollapsed: Observable<boolean>;

  public menu: Observable<SidebarMenu>;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.isSidebarCollapsed = this.store.pipe(select(selectIsSidebarCollapsed));
    this.menu = this.store.pipe(select(selectMenu));
  }

  public toggleSectionCollapse(sectionIndex: number): void {
    this.store.dispatch(new fromSidebar.ToggleCollapsibleSectionAction({ sectionIndex }));
  }

  public dispatchAction(action: Action): void {
    this.store.dispatch(action);
  }

  public onUserChangeEnd(sidebarItem: SidebarItem) {
    const filters = sidebarItem.queryParams.filters;
    sidebarItem.queryParams[`${sidebarItem.facet.field}.filter`] = `[${sidebarItem.rangeValues.from} TO ${sidebarItem.rangeValues.to}]`;
    if (sidebarItem.queryParams.filters.indexOf(sidebarItem.facet.field) < 0) {
      sidebarItem.queryParams.filters = filters.length ? `${filters},${sidebarItem.facet.field}` : sidebarItem.facet.field;
    }
    this.store.dispatch(new fromRouter.Go({
      path: sidebarItem.route,
      query: sidebarItem.queryParams
    }));
  }

}
