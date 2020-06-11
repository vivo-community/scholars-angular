import { inject, TestBed } from '@angular/core/testing';
import { testAppConfig } from 'src/test.config';
import { RestService } from './rest.service';
import { StatsService } from './stats.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { getRequest } from 'src/app/app.browser.module';

describe('StatsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: 'APP_CONFIG', useValue: testAppConfig },
        { provide: REQUEST, useFactory: getRequest },
        StatsService,
        RestService
      ]
    });
  });

  it('should be created', inject([StatsService], (service: StatsService) => {
    expect(service).toBeTruthy();
  }));
});
