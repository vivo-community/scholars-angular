import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'scholars-copyright',
  templateUrl: 'copyright.component.html',
  styleUrls: ['copyright.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyrightComponent {

  public updated: Date = new Date();

}
