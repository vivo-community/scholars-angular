import { inject, TestBed } from '@angular/core/testing';
import { testAppConfig } from 'src/test.config';
import { RestService } from '../service/rest.service';
import { StatsGuard } from './stats.guard';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { getRequest } from 'src/app/app.browser.module';

describe('StatsGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: 'APP_CONFIG', useValue: testAppConfig },
        { provide: REQUEST, useFactory: getRequest },
        StatsGuard,
        RestService
      ]
    });
  });

  it('should be created', inject([StatsGuard], (guard: StatsGuard) => {
    expect(guard).toBeTruthy();
  }));
});
