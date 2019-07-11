import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { metaReducers, reducers } from '../../core/store';
import { EllipsisPipe } from '../../shared/utilities/ellipsis.pipe';

import { RecentPublicationsComponent } from './recent-publications.component';

describe('RecentPublicationsComponent', () => {
    let component: RecentPublicationsComponent;
    let fixture: ComponentFixture<RecentPublicationsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(reducers, {
                    metaReducers
                }),
                TranslateModule.forRoot(),
            ],
            declarations: [
                EllipsisPipe,
                RecentPublicationsComponent
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
