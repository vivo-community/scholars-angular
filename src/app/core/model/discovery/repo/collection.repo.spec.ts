import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';

import { REQUEST } from '@nguniversal/express-engine/tokens';

import { StoreModule } from '@ngrx/store';

import { RestService } from '../../../service/rest.service';
import { CollectionRepo } from './collection.repo';

import { metaReducers, reducers } from '../../../store';

import { getRequest } from '../../../../app.browser.module';

describe('CollectionRepo', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                StoreModule.forRoot(reducers, {
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
                RestService,
                CollectionRepo
            ]
        });
    });

    it('should be created', inject([CollectionRepo], (service: CollectionRepo) => {
        expect(service).toBeTruthy();
    }));

});
