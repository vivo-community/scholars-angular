import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { metaReducers, reducers } from '../../core/store';

import { RecentPublicationsComponent } from './recent-publications.component';
import { testAppConfig } from '../../../test';

describe('RecentPublicationsComponent', () => {
    let component: RecentPublicationsComponent;
    let fixture: ComponentFixture<RecentPublicationsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(reducers(testAppConfig), {
                    metaReducers,
                    runtimeChecks: {
                        strictStateImmutability: false,
                        strictActionImmutability: false,
                        strictStateSerializability: false,
                        strictActionSerializability: false
                    }
                }),
                TranslateModule.forRoot(),
            ],
            declarations: [
                RecentPublicationsComponent
            ],
            providers: [
                { provide: 'APP_CONFIG', useValue: testAppConfig }
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RecentPublicationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
