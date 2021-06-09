import { Injectable } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';

import { scheduled } from 'rxjs';
import { asapScheduler } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { AlertService } from '../../service/alert.service';
import { ThemeService } from '../../service/theme.service';

import { Theme } from '../../model/theme';

import * as fromTheme from './theme.actions';
import { Action } from '@ngrx/store';

@Injectable()
export class ThemeEffects implements OnInitEffects {

  constructor(
    private actions: Actions,
    private themeService: ThemeService,
    private alert: AlertService
  ) {

  }

  loadActiveTheme = createEffect(() => this.actions.pipe(
    ofType(fromTheme.ThemeActionTypes.LOAD_ACTIVE),
    switchMap(() =>
      this.themeService.getActiveTheme().pipe(
        map((theme: Theme) => new fromTheme.LoadActiveThemeSuccessAction({ theme })),
        catchError((response) => scheduled([new fromTheme.LoadActiveThemeFailureAction({ response })], asapScheduler))
      )
    )
  ));

  loadActiveThemeSuccess = createEffect(() => this.actions.pipe(
    ofType(fromTheme.ThemeActionTypes.LOAD_ACTIVE_SUCCESS),
    map((action: fromTheme.LoadActiveThemeSuccessAction) => action.payload.theme),
    switchMap((theme: Theme) =>
      this.themeService.applyActiveTheme(theme).pipe(
        map((style: SafeStyle) => new fromTheme.ApplyActiveThemeSuccessAction({ style })),
        catchError((error) => scheduled([new fromTheme.ApplyActiveThemeFailureAction({ error })], asapScheduler))
      )
    )
  ));

  loadActiveThemeFailure = createEffect(() => this.actions.pipe(
    ofType(fromTheme.ThemeActionTypes.LOAD_ACTIVE_FAILURE),
    map((action: fromTheme.LoadActiveThemeFailureAction) => this.alert.loadActiveThemeFailureAlert(action.payload))
  ));

  applyActiveThemeFailure = createEffect(() => this.actions.pipe(
    ofType(fromTheme.ThemeActionTypes.APPLY_ACTIVE_FAILURE),
    map((action: fromTheme.ApplyActiveThemeFailureAction) => this.alert.applyActiveThemeFailureAlert(action.payload))
  ));

  ngrxOnInitEffects(): Action {
    return new fromTheme.LoadActiveThemeAction();
  }

}
