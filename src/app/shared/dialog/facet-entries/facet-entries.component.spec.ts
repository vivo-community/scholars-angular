import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared.module';

import { RestService } from 'src/app/core/service/rest.service';
import { IndividualRepo } from 'src/app/core/model/discovery/repo/individual.repo';

import { FacetEntriesComponent } from './facet-entries.component';

import { metaReducers, reducers } from '../../../core/store';
import { testAppConfig } from '../../../../test.config';

import { getRequest } from 'src/app/app.browser.module';
import { APP_CONFIG } from 'src/app/app.config';

describe('FacetEntriesComponent', () => {
  let component: FacetEntriesComponent;
  let fixture: ComponentFixture<FacetEntriesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        SharedModule,
        StoreModule.forRoot(reducers(testAppConfig), {
          metaReducers,
          runtimeChecks: {
            strictStateImmutability: false,
            strictActionImmutability: false,
            strictStateSerializability: false,
            strictActionSerializability: false,
          },
        }),
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        { provide: REQUEST, useFactory: getRequest },
        { provide: APP_CONFIG, useValue: testAppConfig },
        RestService,
        IndividualRepo
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacetEntriesComponent);
    component = fixture.componentInstance;
    component.name = 'Test';
    component.field = 'test';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
