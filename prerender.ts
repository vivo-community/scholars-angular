// Load zone.js for the server.
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { writeFile, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

import { enableProdMode } from '@angular/core';

import { join } from 'path';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import { renderModuleFactory } from '@angular/platform-server';

import { ROUTES } from './static.paths';

const PORT = Number(process.env.PORT) || 4200;
const HOST = process.env.HOST || 'localhost';
const BASE_HREF = process.env.BASE_HREF || '/';

const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:9000';
const VIVO_URL = process.env.VIVO_URL || 'https://scholars.library.tamu.edu/vivo';
const VIVO_EDITOR_URL = process.env.VIVO_EDITOR_URL || 'https://scholars.library.tamu.edu/vivo_editor';

const appConfig = {
    host: HOST,
    port: PORT,
    baseHref: BASE_HREF,
    serviceUrl: SERVICE_URL,
    vivoUrl: VIVO_URL,
    vivoEditorUrl: VIVO_EDITOR_URL
};

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main');

const BROWSER_FOLDER = join(process.cwd(), 'browser');

// Load the index.html file containing referances to your application bundle.
const index = readFileSync(join('browser', 'index.html'), 'utf8');

writeFile('./dist/browser/assets/appConfig.json', JSON.stringify(appConfig), (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Static runtime app config created:', appConfig);
    }
});

let previousRender = Promise.resolve();

// Iterate each route path
ROUTES.forEach(route => {
    const fullPath = join(BROWSER_FOLDER, route);

    // Make sure the directory structure is there
    if (!existsSync(fullPath)) {
        mkdirSync(fullPath);
    }

    // Writes rendered HTML to index.html, replacing the file if it already exists.
    previousRender = previousRender.then(_ => renderModuleFactory(AppServerModuleNgFactory, {
        document: index,
        url: route,
        extraProviders: [
            provideModuleMap(LAZY_MODULE_MAP),
            {
                provide: 'APP_CONFIG',
                useValue: appConfig
            }
        ]
    })).then(html => writeFileSync(join(fullPath, 'index.html'), html));
});
