import 'zone.js/dist/zone-node';

import { writeFile } from 'fs';

import { enableProdMode } from '@angular/core';

// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';

// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import * as compression from 'compression';
import * as express from 'express';

import { join } from 'path';

import { AppConfig } from './src/app/app.config';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const server = express();
server.use(compression());

const router = express.Router();

const HOST = process.env.HOST || 'localhost';
const PORT = Number(process.env.PORT) || 4200;
const BASE_HREF = process.env.BASE_HREF || '/';

const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:9000';
const VIVO_URL = process.env.VIVO_URL || 'https://scholars.library.tamu.edu/vivo';
const VIVO_EDITOR_URL = process.env.VIVO_EDITOR_URL || 'https://scholars.library.tamu.edu/vivo_editor';

const appConfig: AppConfig = {
    host: HOST,
    port: PORT,
    baseHref: BASE_HREF,
    serviceUrl: SERVICE_URL,
    vivoUrl: VIVO_URL,
    vivoEditorUrl: VIVO_EDITOR_URL
};

const DIST_FOLDER = join(process.cwd(), 'dist');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./server/main');

writeFile('./dist/browser/assets/appConfig.json', JSON.stringify(appConfig), (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Static runtime app config created:');
        console.log(appConfig);
    }
});

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
server.engine('html', ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [
        provideModuleMap(LAZY_MODULE_MAP),
        {
            provide: 'APP_CONFIG',
            useValue: appConfig
        }
    ]
}));

server.set('view engine', 'html');
server.set('views', join(DIST_FOLDER, 'browser'));

// Serve static files from /browser
router.get('*.*', express.static(join(DIST_FOLDER, 'browser'), {
    maxAge: '1y'
}));

// All regular routes use the Universal engine
router.get('*', (req, res) => {
    res.render(join(DIST_FOLDER, 'browser', 'index.html'), {
        req,
        res
    });
});

server.use(BASE_HREF, router);

// Start up the Node server
server.listen(PORT, () => {
    console.log(`Node Express server listening on http://${HOST}:${PORT}${BASE_HREF}`);
});
