import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { APP_CONFIG } from 'src/app/app.config';
import { testAppConfig } from '../../../test.config';
import { metaReducers, reducers } from '../../core/store';
import { SharedModule } from '../shared.module';
import { SustainableDevelopmentGoalsComponent } from './sustainable-development-goals.component';

describe('SustainableDevelopmentGoalsComponent', () => {
  let component: SustainableDevelopmentGoalsComponent;
  let fixture: ComponentFixture<SustainableDevelopmentGoalsComponent>;

  beforeEach(waitForAsync(() => {
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
            strictActionSerializability: false,
          },
        }),
        TranslateModule.forRoot(),
      ],
      providers: [{ provide: APP_CONFIG, useValue: testAppConfig }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SustainableDevelopmentGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
