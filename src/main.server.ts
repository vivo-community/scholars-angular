// https://github.com/angular/angular/issues/15730
import * as xhr2 from 'xhr2';

xhr2.prototype._restrictedHeaders.cookie = false;

import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

export { AppServerModule } from './app/app.server.module';
export { renderModuleFactory } from '@angular/platform-server';
