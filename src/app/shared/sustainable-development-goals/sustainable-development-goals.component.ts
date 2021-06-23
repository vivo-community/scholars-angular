import { Component } from '@angular/core';
import { Params } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DiscoveryView, OpKey } from 'src/app/core/model/view';
import { AppState } from 'src/app/core/store';
import { selectDiscoveryViewByClass, selectResourcesCountByLabel } from 'src/app/core/store/sdr';
import * as fromSdr from '../../core/store/sdr/sdr.actions';
import { getQueryParams } from '../utilities/view.utility';

@Component({
  selector: 'scholars-sustainable-development-goals',
  templateUrl: 'sustainable-development-goals.component.html',
  styleUrls: ['sustainable-development-goals.component.scss']
})
export class SustainableDevelopmentGoalsComponent {

  goals: { title: string, value: string, color: string, icon?: string }[] = [
    { title: 'SDG 1', value: '1 No Poverty', color: '#E5243B' },
    { title: 'SDG 2', value: '2 Zero Hunger', color: '#DDA63A' },
    { title: 'SDG 3', value: '3 Good Health and Well-Being', color: '#4C9F38' },
    { title: 'SDG 4', value: '4 Quality Education', color: '#C5192D' },
    { title: 'SDG 5', value: '5 Gender Equality', color: '#FF3A21' },
    { title: 'SDG 6', value: '6 Clean Water and Sanitation', color: '#26BDE2' },
    { title: 'SDG 7', value: '7 Affordable and Clean Energy', color: '#FCC30B' },
    { title: 'SDG 8', value: '8 Decent Work and Economic Growth', color: '#A21942' },
    { title: 'SDG 9', value: '9 Industry, Innovation and Infrastructure', color: '#FD6925' },
    { title: 'SDG 10', value: '10 Reduced Inequalities', color: '#DD1367' },
    { title: 'SDG 11', value: '11 Sustainable Cities and Communities', color: '#FD9D24' },
    { title: 'SDG 12', value: '12 Responsible Consumption and Production', color: '#BF8B2E' },
    { title: 'SDG 13', value: '13 Climate Action', color: '#3F7E44' },
    { title: 'SDG 14', value: '14 Life Below Water', color: '#0A97D9' },
    { title: 'SDG 15', value: '15 Life on Land', color: '#56C02B' },
    { title: 'SDG 16', value: '16 Peace, Justice and Strong Institutions', color: '#00689D' },
    { title: 'SDG 17', value: '17 Partnerships for the Goals', color: '#19486A' }
  ];

  public profileCount: Observable<number>;

  public profileDiscoveryView: Observable<DiscoveryView>;

  public researchCount: Observable<number>;

  public researchDiscoveryView: Observable<DiscoveryView>;

  constructor(private store: Store<AppState>) {
    this.goals.forEach(goal => {
      goal.icon = `assets/images/goals/${goal.value}.png`;
    });
  }

  hidden(goal: any): void {
    goal.icon = `assets/images/goals/${goal.value}.png`;
  }

  shown(goal: any): void {
    goal.icon = `assets/images/goals/${goal.value} Selected.png`;

    const profileTitle = `Profile ${goal.title}`;

    this.store.dispatch(
      new fromSdr.CountResourcesAction('individual', {
        label: profileTitle,
        request: this.buildRequest('Person', goal, 'selectedPublicationTag')
      })
    );

    this.profileCount = this.store.pipe(select(selectResourcesCountByLabel('individual', profileTitle)));

    this.profileDiscoveryView = this.store.pipe(
      select(selectDiscoveryViewByClass('Person')),
      filter((view: DiscoveryView) => view !== undefined)
    );

    const researchTitle = `Research ${goal.title}`;

    this.store.dispatch(
      new fromSdr.CountResourcesAction('individual', {
        label: researchTitle,
        request: this.buildRequest('Document', goal, 'tags')
      })
    );

    this.researchCount = this.store.pipe(select(selectResourcesCountByLabel('individual', researchTitle)));

    this.researchDiscoveryView = this.store.pipe(
      select(selectDiscoveryViewByClass('Document')),
      filter((view: DiscoveryView) => view !== undefined)
    );
  }

  getDiscoveryRouterLink(discoveryView: DiscoveryView): string[] {
    return [`/discovery/${discoveryView.name}`];
  }

  getDiscoveryQueryParams(discoveryView: DiscoveryView, goal: any, field: string): Params {
    const queryParams: Params = Object.assign({}, getQueryParams(discoveryView));
    queryParams.page = 1;
    queryParams[`${field}.filter`] = goal.value;
    queryParams[`${field}.opKey`] = 'EQUALS';
    queryParams.filters += `,${field}`;
    return queryParams;
  }

  trackByFn(index, item) {
    return index;
  }

  private buildRequest(classifier: string, goal: any, field: string): any {
    return {
      filters: [
        {
          field: 'class',
          value: classifier,
          opKey: OpKey.EQUALS,
        },
        {
          field,
          value: goal.value,
          opKey: OpKey.EQUALS,
        }
      ]
    };
  }

}
