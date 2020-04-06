import { inject, TestBed } from '@angular/core/testing';

import { StompService } from './stomp.service';
import { testAppConfig } from '../../../test.config';

describe('StompService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StompService, { provide: 'APP_CONFIG', useValue: testAppConfig }],
    });
  });

  it('should be created', inject([StompService], (service: StompService) => {
    expect(service).toBeTruthy();
  }));
});
