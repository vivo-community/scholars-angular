import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';

import { scheduled } from 'rxjs';
import { queueScheduler } from 'rxjs';

import { AppState } from '../../../core/store';
import { DialogButtonType, DialogControl } from '../../../core/model/dialog';

import * as fromDialog from '../../../core/store/dialog/dialog.actions';

@Component({
  selector: 'scholars-search-tips',
  templateUrl: './search-tips.component.html',
  styleUrls: ['./search-tips.component.scss'],
})
export class SearchTipsComponent implements OnInit {

  public dialog: DialogControl;

  constructor(private translate: TranslateService, private store: Store<AppState>) {}

  ngOnInit() {
    this.dialog = {
      title: this.translate.get('SHARED.DIALOG.SEARCH_TIPS.TITLE'),
      close: {
        type: DialogButtonType.OUTLINE_INFO,
        label: this.translate.get('SHARED.DIALOG.SEARCH_TIPS.CANCEL'),
        action: () => this.store.dispatch(new fromDialog.CloseDialogAction()),
        disabled: () => scheduled([false], queueScheduler),
      },
    };
  }
}
