import { InjectionToken } from '@angular/core';

import { ActionReducerMap, MetaReducer } from '@ngrx/store';

import { AppConfig, APP_CONFIG } from '../../app.config';

import { Individual } from '../model/discovery';

import { Theme } from '../model/theme';
import { User } from '../model/user';

import { DirectoryView, DiscoveryView, DisplayView } from '../model/view';

import * as fromRouter from '@ngrx/router-store';

import * as fromAlert from './alert/alert.reducer';
import * as fromAuth from './auth/auth.reducer';
import * as fromDialog from './dialog/dialog.reducer';
import * as fromLanguage from './language/language.reducer';
import * as fromLayout from './layout/layout.reducer';
import * as fromMetadata from './metadata/metadata.reducer';
import * as fromSidebar from './sidebar/sidebar.reducer';
import * as fromSdr from './sdr/sdr.reducer';
import * as fromStomp from './stomp/stomp.reducer';
import * as fromTheme from './theme/theme.reducer';
import * as fromRootStore from './root-store.reducer';

export interface AppState {
  alert: fromAlert.AlertState;
  auth: fromAuth.AuthState;
  dialog: fromDialog.DialogState;
  language: fromLanguage.LanguageState;
  layout: fromLayout.LayoutState;
  metadata: fromMetadata.MetadataState;
  sidebar: fromSidebar.SidebarState;
  stomp: fromStomp.StompState;
  theme: fromTheme.ThemeState;
  individual: fromSdr.SdrState<Individual>;
  themes: fromSdr.SdrState<Theme>;
  users: fromSdr.SdrState<User>;
  directoryViews: fromSdr.SdrState<DirectoryView>;
  discoveryViews: fromSdr.SdrState<DiscoveryView>;
  displayViews: fromSdr.SdrState<DisplayView>;
  router: fromRouter.RouterReducerState;
}

export const reducers = (appConfig: AppConfig): ActionReducerMap<AppState> => {
  const additionalContext = {
    vivoUrl: appConfig.vivoUrl,
    serviceUrl: appConfig.serviceUrl,
  };
  return {
    alert: fromAlert.reducer,
    auth: fromAuth.reducer,
    dialog: fromDialog.reducer,
    language: fromLanguage.reducer,
    layout: fromLayout.reducer,
    metadata: fromMetadata.reducer,
    sidebar: fromSidebar.reducer,
    stomp: fromStomp.reducer,
    theme: fromTheme.reducer,
    individual: fromSdr.getSdrReducer<Individual>('individual', additionalContext),
    themes: fromSdr.getSdrReducer<Theme>('themes', additionalContext),
    users: fromSdr.getSdrReducer<User>('users', additionalContext),
    directoryViews: fromSdr.getSdrReducer<DirectoryView>('directoryViews', additionalContext),
    discoveryViews: fromSdr.getSdrReducer<DiscoveryView>('discoveryViews', additionalContext),
    displayViews: fromSdr.getSdrReducer<DisplayView>('displayViews', additionalContext),
    router: fromRouter.routerReducer,
  };
};

export const reducerToken = new InjectionToken<ActionReducerMap<AppState>>('Registered Reducers');

export const reducerProvider = {
  provide: reducerToken,
  useFactory: reducers,
  deps: [APP_CONFIG],
};

export const metaReducers: MetaReducer<AppState>[] = [fromRootStore.universalMetaReducer];
