import { isPlatformBrowser, Location } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Effect, ofType, Actions } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';

import { defer, scheduled, EMPTY } from 'rxjs';
import { asap } from 'rxjs/internal/scheduler/asap';
import { map, withLatestFrom } from 'rxjs/operators';

import { AppState } from '../';
import { WindowDimensions } from '../layout/layout.reducer';

import { selectWindowDimensions } from '../layout';
import { selectRouterUrl } from '../router';
import { selectMenu } from '../sidebar';
import { SidebarMenu } from '../../model/sidebar';

import * as fromLayout from '../layout/layout.actions';
import * as fromSidebar from '../sidebar/sidebar.actions';

@Injectable()
export class LayoutEffects {

  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private actions: Actions,
    private store: Store<AppState>,
    private location: Location,
    private router: Router
  ) { }

  @Effect({ dispatch: false }) updateQueryParamOnSidebarToggleCollapse = this.actions.pipe(
    ofType(fromSidebar.SidebarActionTypes.TOGGLE_COLLAPSIBLE_SECTION),
    map((action: fromSidebar.ToggleCollapsibleSectionAction) => action.payload.sectionIndex),
    withLatestFrom(
      this.store.pipe(select(selectMenu)),
      this.store.pipe(select(selectRouterUrl))
    ),
    map(([sectionIndex, menu, url]) => this.updateUrl(menu, url))
  );

  @Effect({ dispatch: false }) updateQueryParamOnLoadSidebar = this.actions.pipe(
    ofType(fromSidebar.SidebarActionTypes.LOAD_SIDEBAR),
    map((action: fromSidebar.LoadSidebarAction) => action.payload.menu),
    withLatestFrom(this.store.pipe(select(selectRouterUrl))),
    map(([menu, url]) => this.updateUrl(menu, url))
  );

  @Effect() checkSidebarOnResize = this.actions.pipe(
    ofType(fromLayout.LayoutActionTypes.RESIZE_WINDOW),
    map((action: fromLayout.ResizeWindowAction) => action.payload.windowDimensions),
    map((windowDimensions: WindowDimensions) => this.checkSidebar(windowDimensions))
  );

  @Effect() checkSidebarOnLoad = this.actions.pipe(
    ofType(fromSidebar.SidebarActionTypes.LOAD_SIDEBAR),
    withLatestFrom(this.store.pipe(select(selectWindowDimensions))),
    map(([action, windowDimensions]) => this.checkSidebar(windowDimensions))
  );

  @Effect() initLayout = defer(() => {
    if (isPlatformBrowser(this.platformId)) {
      return scheduled(
        [
          new fromLayout.ResizeWindowAction({
            windowDimensions: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
          }),
        ],
        asap
      );
    }
    return EMPTY;
  });

  private checkSidebar(windowDimensions: WindowDimensions): fromLayout.LayoutActions {
    return windowDimensions.width <= 991 ? new fromLayout.CloseSidebarAction() : new fromLayout.OpenSidebarAction();
  }

  private updateUrl(menu: SidebarMenu, url: string): void {
    const tree = this.router.parseUrl(url);
    const expanded = menu.sections.filter(section => !section.collapsed).map(section => encodeURIComponent(section.title)).join(',');
    if (expanded.length > 0) {
      tree.queryParams.expanded = expanded;
    } else {
      delete tree.queryParams.expanded;
    }
    this.location.replaceState(this.router.serializeUrl(tree));
  }

}
