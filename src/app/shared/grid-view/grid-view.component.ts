import { Component, Input } from '@angular/core';
import { CollectionView } from '../../core/model/view';
import { fadeOutIn } from '../utilities/animation.utility';

@Component({
  selector: 'scholars-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss'],
  animations: [fadeOutIn],
})
export class GridViewComponent {
  @Input()
  public view: CollectionView;

  @Input()
  public resources: any[];

  @Input()
  public loading: boolean;
}
