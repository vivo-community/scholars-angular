import { DOCUMENT } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import { REQUEST } from '@nguniversal/express-engine/tokens';

import { RestService } from './rest.service';
import { ThemeService } from './theme.service';

import { getRequest, createStyleLoader } from '../../app.browser.module';

import { ComputedStyleLoader } from '../computed-style-loader';

describe('ThemeService', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                { provide: REQUEST, useFactory: (getRequest) },
                {
                    provide: 'APP_CONFIG', useValue: {
                        host: 'localhost',
                        port: 4200,
                        baseHref: '/',
                        serviceUrl: 'http://localhost:9000',
                        vivoUrl: 'https://scholars.library.tamu.edu/vivo',
                        vivoEditorUrl: 'https://scholars.library.tamu.edu/vivo_editor'
                    }
                },
                {
                    provide: ComputedStyleLoader,
                    useFactory: (createStyleLoader),
                    deps: [DOCUMENT]
                },
                RestService,
                ThemeService
            ]
        });
    });

    it('should be created', inject([ThemeService], (service: ThemeService) => {
        expect(service).toBeTruthy();
    }));

});
