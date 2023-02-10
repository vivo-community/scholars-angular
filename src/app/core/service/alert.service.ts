import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { AlertLocation, AlertType } from '../model/alert';

import * as fromAlert from '../store/alert/alert.actions';
import * as fromSdr from '../store/sdr/sdr.actions';

@Injectable({
  providedIn: 'root',
})
export class AlertService {

  private isPlatformBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: string, private translate: TranslateService) {
    this.isPlatformBrowser = isPlatformBrowser(platformId);
  }

  // NOTE: using translate.instant requires the translation json be loaded before

  public setLanguageSuccessAlert(payload: { language: string }): fromAlert.AlertActions {
    return this.alert(
      AlertLocation.MAIN,
      AlertType.SUCCESS,
      this.translate.instant('LANGUAGE.SET.SUCCESS', {
        language: payload.language,
      }),
      true,
      10000
    );
  }

  public setLanguageFailureAlert(payload: { error: any; language: string }): fromAlert.AlertActions {
    return this.alert(
      AlertLocation.MAIN,
      AlertType.DANGER,
      this.translate.instant('LANGUAGE.SET.FAILURE', {
        language: payload.language,
      }),
      true,
      15000
    );
  }

  public loginSuccessAlert(): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.SUCCESS, this.translate.instant('SHARED.ALERT.LOGIN_SUCCESS'), true, 10000);
  }

  public loginFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.DIALOG, AlertType.DANGER, payload.response.error, true, 15000);
  }

  public submitRegistrationSuccessAlert(): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.SUCCESS, this.translate.instant('SHARED.ALERT.SUBMIT_REGISTRATION_SUCCESS'), true, 15000);
  }

  public submitRegistrationFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.DIALOG, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public confirmRegistrationSuccessAlert(): fromAlert.AlertActions {
    return this.alert(AlertLocation.DIALOG, AlertType.SUCCESS, this.translate.instant('SHARED.ALERT.CONFIRM_REGISTRATION_SUCCESS'), false);
  }

  public confirmRegistrationFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.error}`, true, 15000);
  }

  public completeRegistrationSuccessAlert(): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.SUCCESS, this.translate.instant('SHARED.ALERT.COMPLETE_REGISTRATION_SUCCESS'), true, 15000);
  }

  public completeRegistrationFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.DIALOG, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public unauthorizedAlert(): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, this.translate.instant('SHARED.ALERT.UNAUTHORIZED'), true, 15000);
  }

  public forbiddenAlert(): fromAlert.AlertActions {
    return this.alert(AlertLocation.DIALOG, AlertType.WARNING, this.translate.instant('SHARED.ALERT.FORBIDDEN'), false);
  }

  public connectFailureAlert(): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, this.translate.instant('SHARED.ALERT.FAILED'), true, 15000);
  }

  public disconnectFailureAlert(): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, this.translate.instant('SHARED.ALERT.FAILED'), true, 15000);
  }

  public unsubscribeFailureAlert(): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, this.translate.instant('SHARED.ALERT.FAILED'), true, 15000);
  }

  public loadActiveThemeFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public applyActiveThemeFailureAlert(payload: { error: string }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, payload.error, true, 15000);
  }

  public getAllFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public getOneFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public getNetworkFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public getCoInvestigatorNetworkFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public findByIdInFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public findByTypesInFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public fetchLazyRefernceFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public pageFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public countFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public recentlyUpdatedFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public searchFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public postSuccessAlert(action: fromSdr.PostResourceSuccessAction): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.SUCCESS, this.translate.instant('SHARED.ALERT.POST_SUCCESS'), true, 10000);
  }

  public postFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public putSuccessAlert(action: fromSdr.PutResourceSuccessAction): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.SUCCESS, this.translate.instant('SHARED.ALERT.PUT_SUCCESS'), true, 10000);
  }

  public putFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public patchSuccessAlert(action: fromSdr.PatchResourceSuccessAction): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.SUCCESS, this.translate.instant('SHARED.ALERT.PATCH_SUCCESS'), true, 10000);
  }

  public patchFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public deleteSuccessAlert(action: fromSdr.DeleteResourceSuccessAction): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.SUCCESS, this.translate.instant('SHARED.ALERT.DELETE_SUCCESS'), true, 10000);
  }

  public deleteFailureAlert(payload: { response: any }): fromAlert.AlertActions {
    return this.alert(AlertLocation.MAIN, AlertType.DANGER, `(${payload.response.status}) ${payload.response.message}`, true, 15000);
  }

  public alert(location: AlertLocation, type: AlertType, message: string, dismissible: boolean, timer?: number): fromAlert.AlertActions {
    if (this.isPlatformBrowser) {
      return new fromAlert.AddAlertAction({
        alert: { location, type, message, dismissible, timer },
      });
    } else {
      return new fromAlert.NoopAlertAction({
        alert: { location, type, message, dismissible, timer },
      });
    }
  }

}
