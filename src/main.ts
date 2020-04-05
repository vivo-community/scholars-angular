import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppBrowserModule } from './app/app.browser.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// fetch runtime configuration, move to provider when Angular supports asynchronous providers
fetch('assets/appConfig.json')
  .then((response) => response.json())
  .then((appConfig) => document.addEventListener('DOMContentLoaded', () => {
    platformBrowserDynamic([{
      provide: 'APP_CONFIG',
      useValue: appConfig,
    }]).bootstrapModule(AppBrowserModule)
      .catch((err) => console.error(err));
  }));
