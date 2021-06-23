import { Injectable, Optional, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { Store, select, Action } from '@ngrx/store';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';

import { scheduled } from 'rxjs';
import { asapScheduler } from 'rxjs';
import { map, switchMap, catchError, withLatestFrom } from 'rxjs/operators';

import { AlertService } from '../../service/alert.service';

import { AppState } from '../';

import { selectDefaultLanguage } from './';

import * as fromLanguage from './language.actions';

import { environment } from '../../../../environments/environment';

@Injectable()
export class LanguageEffects implements OnInitEffects {

  constructor(
    @Optional() @Inject(REQUEST) private request: Request,
    @Inject(PLATFORM_ID) private platformId: any,
    private actions: Actions,
    private store: Store<AppState>,
    private translate: TranslateService,
    private alert: AlertService
  ) {

  }

  setLanguage = createEffect(() => this.actions.pipe(
    ofType(fromLanguage.LanguageActionTypes.SET_LANGUAGE),
    map((action: fromLanguage.SetLanguageAction) => action.payload),
    map((payload: { language: string }) => payload.language),
    switchMap((language: string) =>
      this.translate.use(language).pipe(
        map(() => new fromLanguage.SetLanguageSuccessAction({ language })),
        catchError((error: any) => scheduled([new fromLanguage.SetLanguageFailureAction({ error, language })], asapScheduler))
      )
    )
  ));

  resetLanguage = createEffect(() => this.actions.pipe(
    ofType(fromLanguage.LanguageActionTypes.RESET_LANGUAGE),
    withLatestFrom(this.store.pipe(select(selectDefaultLanguage))),
    switchMap(([action, language]) =>
      this.translate.use(language).pipe(
        map((r) => new fromLanguage.SetLanguageSuccessAction({ language })),
        catchError((error: any) => scheduled([new fromLanguage.SetLanguageFailureAction({ error, language })], asapScheduler))
      )
    )
  ));

  setLanguageSuccess = createEffect(() => this.actions.pipe(
    ofType(fromLanguage.LanguageActionTypes.SET_LANGUAGE_SUCCESS),
    map((action: fromLanguage.SetLanguageSuccessAction) => this.alert.setLanguageSuccessAlert(action.payload))
  ));

  setDefaultLanguage = createEffect(() => this.actions.pipe(
    ofType(fromLanguage.LanguageActionTypes.SET_DEFAULT_LANGUAGE),
    map((action: fromLanguage.SetLanguageAction) => action.payload),
    map((payload: { language: string }) => payload.language),
    map((language: string) => this.translate.setDefaultLang(language))
  ), { dispatch: false });

  setLanguageFailure = createEffect(() => this.actions.pipe(
    ofType(fromLanguage.LanguageActionTypes.SET_LANGUAGE_FAILURE),
    map((payload: { error: any; language: string }) => this.alert.setLanguageFailureAlert(payload))
  ));

  ngrxOnInitEffects(): Action {
    let language = this.getLanguage();
    // NOTE: this array should be all available language translations
    // TODO: move array into environment
    if (['en'].indexOf(language) < 0) {
      language = environment.language;
    }
    return new fromLanguage.SetDefaultLanguageAction({ language });
  }

  private getLanguage(): string {
    let language: string;
    if (isPlatformBrowser(this.platformId)) {
      language = this.translate.getBrowserLang();
    } else {
      language = (this.request.headers['accept-language'] || '').substring(0, 2);
    }
    return language;
  }

}
