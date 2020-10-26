import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';

import { scheduled } from 'rxjs';
import { queueScheduler } from 'rxjs';

import { DisplayModule } from '../display.module';

import { SubsectionComponent } from './subsection.component';

import { metaReducers, reducers } from '../../core/store';

import { routes } from '../display.routes';
import { testAppConfig } from '../../../test.config';

describe('SubsectionComponent', () => {
  let component: SubsectionComponent;
  let fixture: ComponentFixture<SubsectionComponent>;

  const params = {};

  params['View All.size'] = 10;
  params['View All.page'] = 1;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        DisplayModule,
        StoreModule.forRoot(reducers(testAppConfig), {
          metaReducers,
          runtimeChecks: {
            strictStateImmutability: false,
            strictActionImmutability: false,
            strictStateSerializability: false,
            strictActionSerializability: false,
          },
        }),
        RouterTestingModule.withRoutes(routes[0].children),
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: scheduled([params], queueScheduler),
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubsectionComponent);
    component = fixture.componentInstance;
    component.subsection = {
      name: 'Test',
      field: 'publications',
      order: 1,
      filters: [],
      sort: [],
      pageSize: 5,
      template: '',
      templateFunction: (resource: any) => '',
    };
    component.document = {
      id: 1,
      type: ['Person'],
    };
    // tslint:disable-next-line: no-string-literal
    component.document['publications'] = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
