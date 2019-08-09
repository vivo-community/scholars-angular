import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';

import { REQUEST } from '@nguniversal/express-engine/tokens';

import { StoreModule } from '@ngrx/store';

import { RestService } from '../../../service/rest.service';
import { ThemeRepo } from './theme.repo';

import { metaReducers, reducers } from '../../../store';

import { getRequest } from '../../../../app.browser.module';
import { testAppConfig } from '../../../../../test';

describe('ThemeRepo', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                StoreModule.forRoot(reducers(testAppConfig), {
                    metaReducers,
                    runtimeChecks: {
                        strictStateImmutability: false,
                        strictActionImmutability: false,
                        strictStateSerializability: false,
                        strictActionSerializability: false
                    }
                })
            ],
            providers: [
                { provide: REQUEST, useFactory: (getRequest) },
                { provide: 'APP_CONFIG', useValue: testAppConfig },
                RestService,
                ThemeRepo
            ]
        });
    });

    it('should be created', inject([ThemeRepo], (service: ThemeRepo) => {
        expect(service).toBeTruthy();
    }));

});
