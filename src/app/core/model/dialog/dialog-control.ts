import { UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { DialogButton } from './dialog-button';

export type DialogControl = Readonly<{
  title: Observable<string>;
  form?: UntypedFormGroup;
  close: DialogButton;
  submit?: DialogButton;
}>;
