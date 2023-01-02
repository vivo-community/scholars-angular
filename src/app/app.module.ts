import { isPlatformBrowser, APP_BASE_HREF, DOCUMENT } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PLATFORM_ID, Inject, NgModule } from '@angular/core';
import { makeStateKey, BrowserModule, TransferState } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HeaderModule } from './header/header.module';
import { FooterModule } from './footer/footer.module';
import { RootStoreModule } from './core/store/root-store.module';

import { AppState } from './core/store';

import { AppConfig, APP_CONFIG } from './app.config';

import * as fromStore from './core/store/root-store.actions';

export const NGRX_STATE = makeStateKey('NGRX_STATE');

const getBaseHref = (document: Document, appConfig: AppConfig): string => {
  const baseTag = document.querySelector('head > base');
  baseTag.setAttribute('href', appConfig.baseHref);
  return baseTag.getAttribute('href');
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'scholars-discovery' }),
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    CoreModule.forRoot(),
    NgbModule,
    SharedModule,
    HeaderModule,
    FooterModule,
    RootStoreModule
  ],
  bootstrap: [
    AppComponent
  ],
  providers: [
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseHref,
      deps: [DOCUMENT, APP_CONFIG]
    }
  ]
})
export class AppModule {

  public constructor(
    @Inject(PLATFORM_ID) platformId: string,
    private readonly transferState: TransferState,
    private readonly store: Store<AppState>
  ) {
    if (isPlatformBrowser(platformId)) {
      this.onBrowser();
    } else {
      this.onServer();
    }
  }

  onServer() {
    this.transferState.onSerialize(NGRX_STATE, () => {
      this.store.subscribe((state: any) => {
        return state;
      }).unsubscribe();
    });
  }

  onBrowser() {
    const state = this.transferState.get<any>(NGRX_STATE, {});
    this.transferState.remove(NGRX_STATE);
    this.store.dispatch(new fromStore.RehydrateAction(state));
  }

}
