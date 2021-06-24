import { isPlatformBrowser, Location } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { ofType, Actions, createEffect, OnInitEffects } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';

import { map, withLatestFrom, filter } from 'rxjs/operators';

import { AppState } from '../';
import { WindowDimensions } from '../layout/layout.reducer';

import { selectWindowDimensions } from '../layout';
import { selectRouterUrl } from '../router';
import { selectMenu } from '../sidebar';
import { SidebarMenu } from '../../model/sidebar';

import * as fromLayout from '../layout/layout.actions';
import * as fromSidebar from '../sidebar/sidebar.actions';

@Injectable()
export class LayoutEffects implements OnInitEffects {

  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private actions: Actions,
    private store: Store<AppState>,
    private location: Location,
    private router: Router
  ) { }

  updateQueryParamOnSidebarToggleCollapse = createEffect(() => this.actions.pipe(
    ofType(fromSidebar.SidebarActionTypes.TOGGLE_COLLAPSIBLE_SECTION),
    map((action: fromSidebar.ToggleCollapsibleSectionAction) => action.payload.sectionIndex),
    withLatestFrom(
      this.store.pipe(select(selectMenu)),
      this.store.pipe(select(selectRouterUrl))
    ),
    map(([sectionIndex, menu, url]) => this.updateUrl(menu, url))
  ), { dispatch: false });

  updateQueryParamOnLoadSidebar = createEffect(() => this.actions.pipe(
    ofType(fromSidebar.SidebarActionTypes.LOAD_SIDEBAR),
    map((action: fromSidebar.LoadSidebarAction) => action.payload.menu),
    withLatestFrom(this.store.pipe(select(selectRouterUrl))),
    map(([menu, url]) => this.updateUrl(menu, url))
  ), { dispatch: false });

  checkSidebarOnResize = createEffect(() => this.actions.pipe(
    ofType(fromLayout.LayoutActionTypes.CHECK_WINDOW),
    map((action: fromLayout.CheckWindowAction) => action.payload.windowDimensions),
    withLatestFrom(this.store.pipe(select(selectWindowDimensions))),
    filter(([windowDimensions, lastWindowDimensions]) => lastWindowDimensions.width !== windowDimensions.width),
    map(([windowDimensions, lastWindowDimensions]) => windowDimensions),
    map((windowDimensions: WindowDimensions) => new fromLayout.ResizeWindowAction({ windowDimensions }))
  ));

  checkSidebarOnLoad = createEffect(() => this.actions.pipe(
    ofType(fromSidebar.SidebarActionTypes.LOAD_SIDEBAR, fromLayout.LayoutActionTypes.RESIZE_WINDOW),
    withLatestFrom(this.store.pipe(select(selectWindowDimensions))),
    map(([action, windowDimensions]) => this.checkSidebar(windowDimensions))
  ));

  ngrxOnInitEffects(): Action {
    if (isPlatformBrowser(this.platformId)) {
      return new fromLayout.ResizeWindowAction({
        windowDimensions: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    }
    return { type: '' };
  }

  private checkSidebar(windowDimensions: WindowDimensions): fromLayout.LayoutActions {
    return windowDimensions.width <= 991 ? new fromLayout.CloseSidebarAction() : new fromLayout.OpenSidebarAction();
  }

  private updateUrl(menu: SidebarMenu, url: string): void {
    const tree = this.router.parseUrl(url);
    const expanded = menu.sections
      .filter(section => !section.collapsed)
      .map(section => encodeURIComponent(section.title))
      .join(',');
    if (expanded.length > 0) {
      tree.queryParams.expanded = expanded;
    } else {
      delete tree.queryParams.expanded;
    }
    this.location.replaceState(this.router.serializeUrl(tree));
  }

}
