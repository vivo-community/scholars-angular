import { PipeTransform, Pipe } from '@angular/core';

import { formalize } from 'scholars-embed-utilities';

import { environment } from '../../../environments/environment';

@Pipe({ name: 'formalize' })
export class FormalizePipe implements PipeTransform {

    transform(value) {
        return formalize(value, environment.formalize);
    }

}
