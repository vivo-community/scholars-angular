import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';

import { scheduled } from 'rxjs';
import { asapScheduler } from 'rxjs';

import { SharedModule } from '../shared.module';

import { DialogComponent } from './dialog.component';
import { DialogButtonType } from '../../core/model/dialog';

import { metaReducers, reducers } from '../../core/store';
import { testAppConfig } from '../../../test.config';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

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
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    component.dialog = {
      title: scheduled(['Login'], asapScheduler),
      form: undefined,
      close: {
        type: DialogButtonType.OUTLINE_WARNING,
        label: scheduled(['Cancel'], asapScheduler),
        action: () => {},
        disabled: () => scheduled([false], asapScheduler),
      },
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
