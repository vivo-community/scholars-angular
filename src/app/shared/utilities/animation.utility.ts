import { trigger, style, transition, animate, state } from '@angular/animations';

export const fadeIn = trigger('fadeIn', [transition(':enter', [style({ opacity: 0 }), animate('1s ease-out', style({ opacity: 1 }))])]);

export const expandCollapse = trigger('expandCollapse', [
  state(
    'collapsed',
    style({
      height: '0',
      overflow: 'hidden',
      opacity: '0',
    })
  ),
  state(
    'expanded',
    style({
      overflow: 'hidden',
      opacity: '1',
    })
  ),
  transition('collapsed=>expanded', animate('250ms')),
  transition('expanded=>collapsed', animate('250ms')),
]);
