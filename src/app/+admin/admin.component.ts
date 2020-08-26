import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';

import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AppState } from '../core/store';
import { DiscoveryView } from '../core/model/view';

import { WindowDimensions } from '../core/store/layout/layout.reducer';

import { selectDiscoveryViewByClass } from '../core/store/sdr';
import { selectWindowDimensions } from '../core/store/layout';

export interface AdminTab {
  route: string[];
  translateKey: string;
}

@Component({
  selector: 'scholars-admin',
  templateUrl: 'admin.component.html',
  styleUrls: ['admin.component.scss'],
})
export class AdminComponent implements OnInit {

  public discoveryView: Observable<DiscoveryView>;

  public windowDimensions: Observable<WindowDimensions>;

  public tabs: AdminTab[];

  constructor(private store: Store<AppState>) {
    this.tabs = [
      {
        route: ['/admin/DirectoryViews'],
        translateKey: 'ADMIN.DIRECTORY_VIEWS.TITLE',
      },
      {
        route: ['/admin/DiscoveryViews'],
        translateKey: 'ADMIN.DISCOVERY_VIEWS.TITLE',
      },
      {
        route: ['/admin/DisplayViews'],
        translateKey: 'ADMIN.DISPLAY_VIEWS.TITLE',
      },
      {
        route: ['/admin/Themes'],
        translateKey: 'ADMIN.THEMES.TITLE',
      },
      {
        route: ['/admin/Users'],
        translateKey: 'ADMIN.USERS.TITLE',
      },
    ];
  }

  ngOnInit() {
    this.discoveryView = this.store.pipe(
      select(selectDiscoveryViewByClass('Person')),
      filter((view: DiscoveryView) => view !== undefined)
    );
    this.windowDimensions = this.store.pipe(select(selectWindowDimensions));
  }

  public showTabs(windowDimensions: WindowDimensions): boolean {
    return windowDimensions.width > 767;
  }

}
