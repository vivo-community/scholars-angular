import { APP_BASE_HREF } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../shared/shared.module';

import { DisplayComponent } from './display.component';
import { TabComponent } from './tab/tab.component';

import { routes } from './display.routes';

import { metaReducers, reducers } from '../core/store';
import { testAppConfig } from '../../test';

describe('DisplayComponent', () => {
    let component: DisplayComponent;
    let fixture: ComponentFixture<DisplayComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DisplayComponent,
                TabComponent
            ],
            imports: [
                SharedModule,
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
                RouterTestingModule.withRoutes(routes)
            ],
            providers: [
                { provide: 'APP_CONFIG', useValue: testAppConfig },
                { provide: APP_BASE_HREF, useValue: '/' }
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
