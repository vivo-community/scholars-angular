import { Component } from '@angular/core';

@Component({
  selector: 'scholars-sustainable-development-goals',
  templateUrl: 'sustainable-development-goals.component.html',
  styleUrls: ['sustainable-development-goals.component.scss']
})
export class SustainableDevelopmentGoalsComponent {

  goals = [
    { title: 'SDG 1', icon: 'assets/images/goals/E Inverted Icons_WEB-01.png', selected: 'assets/images/goals/E-WEB-Goal-01.png', color: '#E5243B' },
    { title: 'SDG 2', icon: 'assets/images/goals/E Inverted Icons_WEB-02.png', selected: 'assets/images/goals/E-WEB-Goal-02.png', color: '#DDA63A' },
    { title: 'SDG 3', icon: 'assets/images/goals/E Inverted Icons_WEB-03.png', selected: 'assets/images/goals/E-WEB-Goal-03.png', color: '#4C9F38' },
    { title: 'SDG 4', icon: 'assets/images/goals/E Inverted Icons_WEB-04.png', selected: 'assets/images/goals/E-WEB-Goal-04.png', color: '#C5192D' },
    { title: 'SDG 5', icon: 'assets/images/goals/E Inverted Icons_WEB-05.png', selected: 'assets/images/goals/E-WEB-Goal-05.png', color: '#FF3A21' },
    { title: 'SDG 6', icon: 'assets/images/goals/E Inverted Icons_WEB-06.png', selected: 'assets/images/goals/E-WEB-Goal-06.png', color: '#26BDE2' },
    { title: 'SDG 7', icon: 'assets/images/goals/E Inverted Icons_WEB-07.png', selected: 'assets/images/goals/E-WEB-Goal-07.png', color: '#FCC30B' },
    { title: 'SDG 8', icon: 'assets/images/goals/E Inverted Icons_WEB-08.png', selected: 'assets/images/goals/E-WEB-Goal-08.png', color: '#A21942' },
    { title: 'SDG 9', icon: 'assets/images/goals/E Inverted Icons_WEB-09.png', selected: 'assets/images/goals/E-WEB-Goal-09.png', color: '#FD6925' },
    { title: 'SDG 10', icon: 'assets/images/goals/E Inverted Icons_WEB-10.png', selected: 'assets/images/goals/E-WEB-Goal-10.png', color: '#DD1367' },
    { title: 'SDG 11', icon: 'assets/images/goals/E Inverted Icons_WEB-11.png', selected: 'assets/images/goals/E-WEB-Goal-11.png', color: '#FD9D24' },
    { title: 'SDG 12', icon: 'assets/images/goals/E Inverted Icons_WEB-12.png', selected: 'assets/images/goals/E-WEB-Goal-12.png', color: '#BF8B2E' },
    { title: 'SDG 13', icon: 'assets/images/goals/E Inverted Icons_WEB-13.png', selected: 'assets/images/goals/E-WEB-Goal-13.png', color: '#3F7E44' },
    { title: 'SDG 14', icon: 'assets/images/goals/E Inverted Icons_WEB-14.png', selected: 'assets/images/goals/E-WEB-Goal-14.png', color: '#0A97D9' },
    { title: 'SDG 15', icon: 'assets/images/goals/E Inverted Icons_WEB-15.png', selected: 'assets/images/goals/E-WEB-Goal-15.png', color: '#56C02B' },
    { title: 'SDG 16', icon: 'assets/images/goals/E Inverted Icons_WEB-16.png', selected: 'assets/images/goals/E-WEB-Goal-16.png', color: '#00689D' },
    { title: 'SDG 17', icon: 'assets/images/goals/E Inverted Icons_WEB-17.png', selected: 'assets/images/goals/E-WEB-Goal-17.png', color: '#19486A' }
  ];

  hidden(goal: any): void {
    goal.icon = goal.temp;
  }

  shown(goal: any): void {
    goal.temp = goal.icon;
    goal.icon = goal.selected;
  }

  trackByFn(index, item) {
    return index;
  }

}
