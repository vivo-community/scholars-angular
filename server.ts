import 'zone.js/node';

/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';

import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

import { APP_BASE_HREF } from '@angular/common';

import { ngExpressEngine } from '@nguniversal/express-engine';

import * as express from 'express';
import * as expressStaticGzip from 'express-static-gzip';

import { AppConfig, APP_CONFIG } from './src/app/app.config';
import { AppServerModule } from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(appConfig: AppConfig) {
  const server = express();
  const router = express.Router();
  const distFolder = join(process.cwd(), 'dist/scholars-angular/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';
  const distConfigFile = join(distFolder, 'assets/appConfig.json');

  writeFileSync(distConfigFile, JSON.stringify(appConfig));

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
    providers: [
      {
        provide: APP_CONFIG,
        useValue: appConfig,
      }
    ]
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  router.get('*.*', (req, res, next) => {
    if (req.headers['x-no-compression']) {
      return next;
    }

    return expressStaticGzip(distFolder, {
      enableBrotli: true,
      orderPreference: ['br', 'gzip']
    })(req, res, next);
  });

  router.get('*.*', express.static(distFolder, {
    maxAge: '1y',
  }));

  // All regular routes use the Universal engine
  router.get('*', (req, res) => {
    res.render(indexHtml, {
      req,
      providers: [{
        provide: APP_BASE_HREF,
        useValue: req.baseUrl
      }]
    });
  });

  server.use(appConfig.baseHref, router);

  return server;
}

function run() {
  const HOST = process.env.HOST || 'localhost';
  const PORT = Number(process.env.PORT) || 4200;
  const BASE_HREF = process.env.BASE_HREF || '/';

  const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:9000';
  const EMBED_URL = process.env.EMBED_URL || 'http://localhost:4201';
  const VIVO_URL = process.env.VIVO_URL || 'http://localhost:8080/vivo';
  const VIVO_EDITOR_URL = process.env.VIVO_EDITOR_URL || 'http://localhost:8080/vivo_editor';

  const COLLECT_SEARCH_STATS = process.env.COLLECT_SEARCH_STATS === 'true';

  const appConfig: AppConfig = {
    host: HOST,
    port: PORT,
    baseHref: BASE_HREF,
    serviceUrl: SERVICE_URL,
    embedUrl: EMBED_URL,
    vivoUrl: VIVO_URL,
    vivoEditorUrl: VIVO_EDITOR_URL,
    collectSearchStats: COLLECT_SEARCH_STATS
  };

  // Start up the Node server
  const server = app(appConfig);
  server.listen(PORT, () => {
    console.log(`Node Express server listening on http://${HOST}:${PORT}${BASE_HREF}`);
    console.log('Using runtime app config:');
    console.log(appConfig);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
