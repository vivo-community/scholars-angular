import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';

import { combineLatest, scheduled } from 'rxjs';
import { asapScheduler } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom, skipWhile, take } from 'rxjs/operators';

import { AppState } from '../';

import { User, Role } from '../../model/user';
import { LoginRequest, RegistrationRequest } from '../../model/request';

import { RegistrationStep } from '../../../shared/dialog/registration/registration.component';

import { AlertService } from '../../service/alert.service';
import { AuthService } from '../../service/auth.service';
import { DialogService } from '../../service/dialog.service';

import { selectLoginRedirect, selectUser } from './';
import { selectIsStompConnected } from '../stomp';

import * as fromAuth from './auth.actions';
import * as fromDialog from '../dialog/dialog.actions';
import * as fromRouter from '../router/router.actions';
import * as fromStomp from '../stomp/stomp.actions';
import * as fromSdr from '../sdr/sdr.actions';
import { Action } from '@ngrx/store';

@Injectable()
export class AuthEffects implements OnInitEffects {

  constructor(private actions: Actions, private store: Store<AppState>, private alert: AlertService, private authService: AuthService, private dialog: DialogService) {

  }

  reconnect = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.LOGIN_SUCCESS, fromAuth.AuthActionTypes.LOGOUT_SUCCESS),
    map(() => new fromStomp.DisconnectAction({ reconnect: true }))
  ));

  login = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.LOGIN),
    map((action: fromAuth.LoginAction) => action.payload),
    switchMap((payload: { login: LoginRequest }) =>
      this.authService.login(payload.login).pipe(
        map((user: User) => new fromAuth.LoginSuccessAction({ user })),
        catchError((response) => scheduled([new fromAuth.LoginFailureAction({ response })], asapScheduler))
      )
    )
  ));

  loginSuccess = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.LOGIN_SUCCESS),
    map((action: fromAuth.LoginSuccessAction) => action.payload),
    withLatestFrom(this.store.select(selectLoginRedirect)),
    switchMap(([payload, redirect]) => {
      const actions: Action[] = [
        new fromAuth.GetUserSuccessAction({ user: payload.user }),
        new fromDialog.CloseDialogAction(),
        this.alert.loginSuccessAlert()
      ];
      if (redirect !== undefined) {
        actions.push(new fromRouter.Go(redirect));
      }

      return actions;
    })
  ));

  loginFailure = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.LOGIN_FAILURE),
    map((action: fromAuth.LoginFailureAction) => this.alert.loginFailureAlert(action.payload))
  ));

  submitRegistration = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.SUBMIT_REGISTRATION),
    map((action: fromAuth.SubmitRegistrationAction) => action.payload),
    switchMap((payload: { registration: RegistrationRequest }) =>
      this.authService.submitRegistration(payload.registration).pipe(
        map((registration: RegistrationRequest) => new fromAuth.SubmitRegistrationSuccessAction({ registration })),
        catchError((response) => scheduled([new fromAuth.SubmitRegistrationFailureAction({ response })], asapScheduler))
      )
    )
  ));

  submitRegistrationSuccess = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.SUBMIT_REGISTRATION_SUCCESS),
    map((action: fromAuth.SubmitRegistrationSuccessAction) => action.payload),
    map((payload: { registration: RegistrationRequest }) => payload.registration),
    switchMap(() => [new fromDialog.CloseDialogAction(), this.alert.submitRegistrationSuccessAlert()])
  ));

  submitRegistrationFailure = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.SUBMIT_REGISTRATION_FAILURE),
    map((action: fromAuth.SubmitRegistrationFailureAction) => this.alert.submitRegistrationFailureAlert(action.payload))
  ));

  confirmRegistration = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.CONFIRM_REGISTRATION),
    map((action: fromAuth.ConfirmRegistrationAction) => action.payload),
    switchMap((payload: { key: string }) =>
      this.authService.confirmRegistration(payload.key).pipe(
        map((registration: RegistrationRequest) => new fromAuth.ConfirmRegistrationSuccessAction({ registration })),
        catchError((response) => scheduled([new fromAuth.ConfirmRegistrationFailureAction({ response })], asapScheduler))
      )
    )
  ));

  confirmRegistrationSuccess = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.CONFIRM_REGISTRATION_SUCCESS),
    map((action: fromAuth.ConfirmRegistrationSuccessAction) => action.payload),
    map((payload: { registration: RegistrationRequest }) => payload.registration),
    switchMap((registration: RegistrationRequest) => {
      return [new fromDialog.CloseDialogAction(), this.dialog.registrationDialog(RegistrationStep.COMPLETE, registration), this.alert.confirmRegistrationSuccessAlert()];
    })
  ));

  confirmRegistrationFailure = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.CONFIRM_REGISTRATION_FAILURE),
    map((action: fromAuth.ConfirmRegistrationFailureAction) => action.payload),
    switchMap((payload: { response: any }) => [new fromRouter.Go({ path: ['/'] }), this.alert.confirmRegistrationFailureAlert(payload)])
  ));

  completeRegistration = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.COMPLETE_REGISTRATION),
    map((action: fromAuth.CompleteRegistrationAction) => action.payload),
    switchMap((payload: { key: string; registration: RegistrationRequest }) =>
      this.authService.completeRegistration(payload.key, payload.registration).pipe(
        map((user: User) => new fromAuth.CompleteRegistrationSuccessAction({ user })),
        catchError((response) => scheduled([new fromAuth.CompleteRegistrationFailureAction({ response })], asapScheduler))
      )
    )
  ));

  completeRegistrationSuccess = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.COMPLETE_REGISTRATION_SUCCESS),
    map((action: fromAuth.CompleteRegistrationSuccessAction) => action.payload),
    map((payload: { user: User }) => payload.user),
    switchMap(() => [new fromDialog.CloseDialogAction(), new fromRouter.Go({ path: ['/'] }), this.alert.completeRegistrationSuccessAlert()])
  ));

  completeRegistrationFailure = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.COMPLETE_REGISTRATION_FAILURE),
    map((action: fromAuth.CompleteRegistrationFailureAction) => this.alert.completeRegistrationFailureAlert(action.payload))
  ));

  logout = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.LOGOUT),
    switchMap(() =>
      this.authService.logout().pipe(
        map((response: any) => new fromAuth.LogoutSuccessAction({ message: response.message })),
        catchError((response) => scheduled([new fromAuth.LogoutFailureAction({ response })], asapScheduler))
      )
    )
  ));

  logoutSuccess = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.LOGOUT_SUCCESS),
    switchMap(() => [new fromSdr.ClearResourcesAction('Theme'), new fromSdr.ClearResourcesAction('User'), new fromRouter.Go({ path: ['/'] })])
  ));

  getUser = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.GET_USER),
    switchMap(() =>
      this.authService.getUser().pipe(
        map((user: User) => new fromAuth.GetUserSuccessAction({ user })),
        catchError((response) => scheduled([new fromAuth.GetUserFailureAction({ response })], asapScheduler))
      )
    )
  ));

  getUserSuccess = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.GET_USER_SUCCESS),
    switchMap(() =>
      combineLatest([
        this.store.pipe(select(selectUser), take(1)),
        this.store.pipe(
          select(selectIsStompConnected),
          skipWhile((connected: boolean) => !connected),
          take(1)
        ),
      ])
    ),
    map(
      ([user]) =>
        new fromStomp.SubscribeAction({
          channel: '/user/queue/users',
          handle: (frame: any) => {
            if (frame.command === 'MESSAGE') {
              const body = JSON.parse(frame.body);
              switch (body.action) {
                case 'DELETE':
                  this.store.dispatch(new fromAuth.LogoutAction());
                  this.store.dispatch(this.dialog.notificationDialog('Your account has been deleted!'));
                  break;
                case 'UPDATE':
                  if (body.entity.enabled) {
                    this.store.dispatch(new fromAuth.GetUserSuccessAction({ user: body.entity }));
                    const roles = Object.keys(Role);
                    if (roles.indexOf(body.entity.role) < roles.indexOf(user.role)) {
                      // TODO: request new session to avoid logging out
                      this.store.dispatch(new fromAuth.LogoutAction());
                      this.store.dispatch(this.dialog.notificationDialog('Your permissions have been reduced! Unfortunately, you must log in again.'));
                    } else if (roles.indexOf(body.entity.role) > roles.indexOf(user.role)) {
                      // TODO: request new session to avoid logging out
                      this.store.dispatch(new fromAuth.LogoutAction());
                      this.store.dispatch(this.dialog.notificationDialog('Your permissions have been elevated! Unfortunately, you must log in again.'));
                    }
                  } else {
                    this.store.dispatch(new fromAuth.LogoutAction());
                    this.store.dispatch(this.dialog.notificationDialog('Your account has been disabled!'));
                  }
                  break;
                default:
              }
            }
          },
        })
    )
  ));

  getUserFailure = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.GET_USER_FAILURE),
    map(() => this.authService.clearSession())
  ), { dispatch: false });

  checkSession = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.CHECK_SESSION),
    map(
      () =>
        new fromAuth.SessionStatusAction({
          authenticated: this.authService.hasSession(),
        })
    )
  ));

  sessionStatus = createEffect(() => this.actions.pipe(
    ofType(fromAuth.AuthActionTypes.SESSION_STATUS),
    map((action: fromAuth.SessionStatusAction) => action.payload),
    map((payload: { authenticated: boolean }) => payload.authenticated),
    map((authenticated: boolean) => {
      if (authenticated) {
        this.store.dispatch(new fromAuth.GetUserAction());
      }
    })
  ), { dispatch: false });

  ngrxOnInitEffects(): Action {
    return new fromAuth.CheckSessionAction();
  }

}
