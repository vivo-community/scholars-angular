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

  goals = [
    { title: 'SDG 1', value: '1 no poverty', icon: 'assets/images/goals/E Inverted Icons_WEB-01.png', selected: 'assets/images/goals/E-WEB-Goal-01.png', color: '#E5243B' },
    { title: 'SDG 2', value: '2 zero hunger', icon: 'assets/images/goals/E Inverted Icons_WEB-02.png', selected: 'assets/images/goals/E-WEB-Goal-02.png', color: '#DDA63A' },
    { title: 'SDG 3', value: '3 good health and well-being', icon: 'assets/images/goals/E Inverted Icons_WEB-03.png', selected: 'assets/images/goals/E-WEB-Goal-03.png', color: '#4C9F38' },
    { title: 'SDG 4', value: '4 quality education', icon: 'assets/images/goals/E Inverted Icons_WEB-04.png', selected: 'assets/images/goals/E-WEB-Goal-04.png', color: '#C5192D' },
    { title: 'SDG 5', value: '5 gender equality', icon: 'assets/images/goals/E Inverted Icons_WEB-05.png', selected: 'assets/images/goals/E-WEB-Goal-05.png', color: '#FF3A21' },
    { title: 'SDG 6', value: '6 clean water and sanitation', icon: 'assets/images/goals/E Inverted Icons_WEB-06.png', selected: 'assets/images/goals/E-WEB-Goal-06.png', color: '#26BDE2' },
    { title: 'SDG 7', value: '7 affordable and clean energy', icon: 'assets/images/goals/E Inverted Icons_WEB-07.png', selected: 'assets/images/goals/E-WEB-Goal-07.png', color: '#FCC30B' },
    { title: 'SDG 8', value: '8 decent work and economic growth', icon: 'assets/images/goals/E Inverted Icons_WEB-08.png', selected: 'assets/images/goals/E-WEB-Goal-08.png', color: '#A21942' },
    { title: 'SDG 9', value: '9 industry, innovation and infrastructure', icon: 'assets/images/goals/E Inverted Icons_WEB-09.png', selected: 'assets/images/goals/E-WEB-Goal-09.png', color: '#FD6925' },
    { title: 'SDG 10', value: '10 reduced inequalities', icon: 'assets/images/goals/E Inverted Icons_WEB-10.png', selected: 'assets/images/goals/E-WEB-Goal-10.png', color: '#DD1367' },
    { title: 'SDG 11', value: '11 sustainable cities and communities', icon: 'assets/images/goals/E Inverted Icons_WEB-11.png', selected: 'assets/images/goals/E-WEB-Goal-11.png', color: '#FD9D24' },
    { title: 'SDG 12', value: '12 responsible consumption and production', icon: 'assets/images/goals/E Inverted Icons_WEB-12.png', selected: 'assets/images/goals/E-WEB-Goal-12.png', color: '#BF8B2E' },
    { title: 'SDG 13', value: '13 climate action', icon: 'assets/images/goals/E Inverted Icons_WEB-13.png', selected: 'assets/images/goals/E-WEB-Goal-13.png', color: '#3F7E44' },
    { title: 'SDG 14', value: '14 life below water', icon: 'assets/images/goals/E Inverted Icons_WEB-14.png', selected: 'assets/images/goals/E-WEB-Goal-14.png', color: '#0A97D9' },
    { title: 'SDG 15', value: '15 life on land', icon: 'assets/images/goals/E Inverted Icons_WEB-15.png', selected: 'assets/images/goals/E-WEB-Goal-15.png', color: '#56C02B' },
    { title: 'SDG 16', value: '16 peace, justice and strong institutions', icon: 'assets/images/goals/E Inverted Icons_WEB-16.png', selected: 'assets/images/goals/E-WEB-Goal-16.png', color: '#00689D' },
    { title: 'SDG 17', value: '17 partenrships for the goals', icon: 'assets/images/goals/E Inverted Icons_WEB-17.png', selected: 'assets/images/goals/E-WEB-Goal-17.png', color: '#19486A' }
  ];

  public profileCount: Observable<number>;

  public profileDiscoveryView: Observable<DiscoveryView>;

  public researchCount: Observable<number>;

  public researchDiscoveryView: Observable<DiscoveryView>;

  constructor(private store: Store<AppState>) { }

  hidden(goal: any): void {
    goal.icon = goal.temp;
  }

  shown(goal: any): void {
    goal.temp = goal.icon;
    goal.icon = goal.selected;

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
