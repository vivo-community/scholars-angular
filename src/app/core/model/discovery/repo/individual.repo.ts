import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { AbstractSdrRepo } from '../../sdr/repo';
import { Individual } from '../individual';

@Injectable({
    providedIn: 'root',
})
export class IndividualRepo extends AbstractSdrRepo<Individual> {

    protected path(): string {
        return 'individuals';
    }

    public post(individual: Individual): Observable<Individual> {
        throw new Error('Individuals does not support post!');
    }

    public put(individual: Individual): Observable<Individual> {
        throw new Error('Individuals does not support put!');
    }

    public patch(individual: Individual): Observable<Individual> {
        throw new Error('Individuals does not support patch!');
    }

    public delete(individual: Individual): Observable<string> {
        throw new Error('Individuals does not support delete!');
    }

    public findByTypesIn(types: string[]): Observable<Individual> {
        throw new Error('Individuals does not support find by types in!');
    }

}
