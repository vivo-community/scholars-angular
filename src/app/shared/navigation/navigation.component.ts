import { Component, OnInit, Inject } from '@angular/core';
import { Params } from '@angular/router';
import { Store, select } from '@ngrx/store';

import { Observable } from 'rxjs';

import { AppState } from '../../core/store';
import { AppConfig } from '../../app.config';
import { DirectoryView } from '../../core/model/view';

import { selectIsNavigationCollapsed, selectIsSidebarExpanded, selectIsNavigationExpanded } from '../../core/store/layout';

import { selectRouterUrl } from '../../core/store/router';
import { selectHasMenu } from '../../core/store/sidebar';
import { selectAllResources } from '../../core/store/sdr';

import { getQueryParams } from '../utilities/view.utility';

import * as fromLayout from '../../core/store/layout/layout.actions';

@Component({
    selector: 'scholars-navigation',
    templateUrl: 'navigation.component.html',
    styleUrls: ['navigation.component.scss']
})
export class NavigationComponent implements OnInit {

    public vivoEditorUrl: string;

    public hasMenu: Observable<boolean>;

    public isSidebarExpanded: Observable<boolean>;

    public isNavigationCollapsed: Observable<boolean>;

    public isNavigationExpanded: Observable<boolean>;

    public url: Observable<string>;

    public directoryViews: Observable<DirectoryView[]>;

    constructor(
        @Inject('APP_CONFIG') appConfig: AppConfig,
        private store: Store<AppState>
    ) {
        this.vivoEditorUrl = appConfig.vivoEditorUrl;
    }

    ngOnInit() {
        this.hasMenu = this.store.pipe(select(selectHasMenu));
        this.isSidebarExpanded = this.store.pipe(select(selectIsSidebarExpanded));
        this.isNavigationCollapsed = this.store.pipe(select(selectIsNavigationCollapsed));
        this.isNavigationExpanded = this.store.pipe(select(selectIsNavigationExpanded));
        this.url = this.store.pipe(select(selectRouterUrl));
        this.directoryViews = this.store.pipe(select(selectAllResources<DirectoryView>('directoryViews')));
    }

    public isActive(directoryView: DirectoryView, url: string): boolean {
        return url.startsWith(`/directory/${directoryView.name}`);
    }

    public getDirectoryRouterLink(directoryView: DirectoryView): string[] {
        return ['/directory', directoryView.name];
    }

    public getDirectoryQueryParams(directoryView: DirectoryView): Params {
        const queryParams: Params = getQueryParams(directoryView);
        queryParams.page = 1;
        return queryParams;
    }

    public toggleNavigation(): void {
        this.store.dispatch(new fromLayout.ToggleNavigationAction());
    }

    public toggleSidebar(): void {
        this.store.dispatch(new fromLayout.ToggleSidebarAction());
    }

}
