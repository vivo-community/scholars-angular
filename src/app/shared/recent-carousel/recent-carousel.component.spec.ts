import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { metaReducers, reducers } from '../../core/store';

import { RecentCarouselComponent } from './recent-carousel.component';
import { testAppConfig } from '../../../test.config';
import { SharedModule } from '../shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { APP_CONFIG } from 'src/app/app.config';

describe('RecentCarouselComponent', () => {
  let component: RecentCarouselComponent;
  let fixture: ComponentFixture<RecentCarouselComponent>;

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
    fixture = TestBed.createComponent(RecentCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
