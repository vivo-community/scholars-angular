import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ellipsis'
})
export class EllipsisPipe implements PipeTransform {

    transform(value: string, limit: number, extra: string) {
        if (extra === undefined) {
            if (value.length > limit) {
                return value.substring(0, limit) + '...';
            }
        } else if (value.length + extra.length > limit) {
            if (limit - extra.length > 0) {
                return value.substring(0, limit - extra.length) + '...';
            } else {
                return '...';
            }
        }
        return value;
    }

}
