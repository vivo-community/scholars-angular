import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';

import { REQUEST } from '@nguniversal/express-engine/tokens';

import { StoreModule } from '@ngrx/store';

import { RestService } from '../../../service/rest.service';
import { DirectoryViewRepo } from './directory-view.repo';

import { metaReducers, reducers } from '../../../store';

import { getRequest } from '../../../../app.browser.module';
import { testAppConfig } from '../../../../../test.config';
import { APP_CONFIG } from 'src/app/app.config';

describe('DirectoryViewRepo', () => {
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
            strictActionSerializability: false,
          },
        }),
      ],
      providers: [
        { provide: REQUEST, useFactory: getRequest },
        { provide: APP_CONFIG, useValue: testAppConfig },
        RestService,
        DirectoryViewRepo
      ],
    });
  });

  it('should be created', inject([DirectoryViewRepo], (service: DirectoryViewRepo) => {
    expect(service).toBeTruthy();
  }));
});
