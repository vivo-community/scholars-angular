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
    { title: 'SDG 1', value: '1 no poverty', color: '#E5243B' },
    { title: 'SDG 2', value: '2 zero hunger', color: '#DDA63A' },
    { title: 'SDG 3', value: '3 good health and well-being', color: '#4C9F38' },
    { title: 'SDG 4', value: '4 quality education', color: '#C5192D' },
    { title: 'SDG 5', value: '5 gender equality', color: '#FF3A21' },
    { title: 'SDG 6', value: '6 clean water and sanitation', color: '#26BDE2' },
    { title: 'SDG 7', value: '7 affordable and clean energy', color: '#FCC30B' },
    { title: 'SDG 8', value: '8 decent work and economic growth', color: '#A21942' },
    { title: 'SDG 9', value: '9 industry, innovation and infrastructure', color: '#FD6925' },
    { title: 'SDG 10', value: '10 reduced inequalities', color: '#DD1367' },
    { title: 'SDG 11', value: '11 sustainable cities and communities', color: '#FD9D24' },
    { title: 'SDG 12', value: '12 responsible consumption and production', color: '#BF8B2E' },
    { title: 'SDG 13', value: '13 climate action', color: '#3F7E44' },
    { title: 'SDG 14', value: '14 life below water', color: '#0A97D9' },
    { title: 'SDG 15', value: '15 life on land', color: '#56C02B' },
    { title: 'SDG 16', value: '16 peace, justice and strong institutions', color: '#00689D' },
    { title: 'SDG 17', value: '17 partnerships for the goals', color: '#19486A' }
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
    goal.icon = `assets/images/goals/${goal.value} selected.png`;

    const profileTitle = `Profile ${goal.title}`;

    this.store.dispatch(
      new fromSdr.CountResourcesAction('individual', {
        label: profileTitle,
        request: this.buildRequest('Person', goal)
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
        request: this.buildRequest('Document', goal)
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

  getDiscoveryQueryParams(discoveryView: DiscoveryView, goal: any): Params {
    const queryParams: Params = getQueryParams(discoveryView);
    queryParams.page = 1;
    queryParams['tags.filter'] = goal.value;
    queryParams['tags.opKey'] = 'EQUALS';
    queryParams.filters += ',tags';
    return queryParams;
  }

  trackByFn(index, item) {
    return index;
  }

  private buildRequest(classifier: string, goal: any): any {
    return {
      filters: [
        {
          field: 'class',
          value: classifier,
          opKey: OpKey.EQUALS,
        },
        {
          field: 'tags',
          value: goal.value,
          opKey: OpKey.EQUALS,
        }
      ]
    };
  }

}
