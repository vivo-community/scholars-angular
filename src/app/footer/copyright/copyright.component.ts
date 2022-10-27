import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { Store, select } from '@ngrx/store';

import { Observable } from 'rxjs';
import { skipWhile } from 'rxjs/operators';

import { AppState } from '../../core/store';
import { Footer } from '../../core/model/theme';
import { selectActiveThemeFooter } from '../../core/store/theme';

@Component({
  selector: 'scholars-copyright',
  templateUrl: 'copyright.component.html',
  styleUrls: ['copyright.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyrightComponent implements OnInit {

  public updated: Date = new Date();

  public footer: Observable<Footer>;

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.footer = this.store.pipe(
      select(selectActiveThemeFooter),
      skipWhile((footer: Footer) => footer === undefined)
    );
  }

}
