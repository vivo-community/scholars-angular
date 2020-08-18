import { Component, Input } from '@angular/core';
import { CollectionView } from '../../core/model/view';
import { fadeOutIn } from '../utilities/animation.utility';

@Component({
  selector: 'scholars-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  animations: [fadeOutIn],
})
export class ListViewComponent {
  @Input()
  public view: CollectionView;

  @Input()
  public resources: any[];

  @Input()
  public loading: boolean;
}
