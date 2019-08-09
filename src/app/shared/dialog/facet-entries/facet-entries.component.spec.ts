import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared.module';

import { FacetEntriesComponent } from './facet-entries.component';
import { FacetType, FacetSort } from '../../../core/model/view';
import { Direction } from '../../../core/model/request';

import { metaReducers, reducers } from '../../../core/store';

import { testAppConfig } from '../../../../test';

describe('FacetEntriesComponent', () => {
    let component: FacetEntriesComponent;
    let fixture: ComponentFixture<FacetEntriesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
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
                RouterTestingModule.withRoutes([])
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FacetEntriesComponent);
        component = fixture.componentInstance;
        component.facet = {
            name: 'Test',
            field: 'test',
            type: FacetType.STRING,
            sort: FacetSort.COUNT,
            direction: Direction.ASC,
            limit: 10,
            hidden: false,
            collapsed: false
        };
        component.sdrFacet = {
            field: 'test',
            entries: []
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
