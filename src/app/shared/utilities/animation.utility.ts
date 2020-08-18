import { trigger, style, transition, animate, state } from '@angular/animations';

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('1s ease-out', style({ opacity: 1 }))
  ])
]);

export const fadeOutIn = trigger('fadeOutIn', [
  state('true', style({ opacity: 0 })),
  state('false', style({ opacity: 1 })),
  transition('false=>true', animate('275ms ease-out')),
  transition('true=>false', animate('275ms ease-in'))
]);

export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({
    height: '0px',
    overflow: 'hidden',
    opacity: 0,
  })),
  state('expanded', style({
    overflow: 'hidden',
    opacity: 1,
  })),
  transition('collapsed=>expanded', animate('250ms')),
  transition('expanded=>collapsed', animate('250ms')),
]);
