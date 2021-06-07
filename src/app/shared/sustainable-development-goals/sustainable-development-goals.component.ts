import { Component } from '@angular/core';

@Component({
  selector: 'scholars-sustainable-development-goals',
  templateUrl: 'sustainable-development-goals.component.html',
  styleUrls: ['sustainable-development-goals.component.scss']
})
export class SustainableDevelopmentGoalsComponent {

  icons = [
    'assets/images/goals/E Inverted Icons_WEB-01.png',
    'assets/images/goals/E Inverted Icons_WEB-02.png',
    'assets/images/goals/E Inverted Icons_WEB-03.png',
    'assets/images/goals/E Inverted Icons_WEB-04.png',
    'assets/images/goals/E Inverted Icons_WEB-05.png',
    'assets/images/goals/E Inverted Icons_WEB-06.png',
    'assets/images/goals/E Inverted Icons_WEB-07.png',
    'assets/images/goals/E Inverted Icons_WEB-08.png',
    'assets/images/goals/E Inverted Icons_WEB-09.png',
    'assets/images/goals/E Inverted Icons_WEB-10.png',
    'assets/images/goals/E Inverted Icons_WEB-11.png',
    'assets/images/goals/E Inverted Icons_WEB-12.png',
    'assets/images/goals/E Inverted Icons_WEB-13.png',
    'assets/images/goals/E Inverted Icons_WEB-14.png',
    'assets/images/goals/E Inverted Icons_WEB-15.png',
    'assets/images/goals/E Inverted Icons_WEB-16.png',
    'assets/images/goals/E Inverted Icons_WEB-17.png'
  ];

  trackByFn(index, item) {
    return index;
  }

}
