import { APP_BASE_HREF, DOCUMENT } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { TranslateModule } from '@ngx-translate/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppConfig, APP_CONFIG } from './app.config';
import { CoreModule } from './core/core.module';
import { RootStoreModule } from './core/store/root-store.module';
import { FooterModule } from './footer/footer.module';
import { HeaderModule } from './header/header.module';
import { SharedModule } from './shared/shared.module';

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
    TransferHttpCacheModule,
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

}
