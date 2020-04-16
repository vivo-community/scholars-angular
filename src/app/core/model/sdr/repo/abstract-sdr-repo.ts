import { Injectable, Inject } from '@angular/core';

import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { RestService } from '../../../service/rest.service';
import { SdrRepo } from './sdr-repo';

import { AppConfig } from '../../../../app.config';
import { Sort, Facetable, Filterable, Boostable, SdrRequest } from '../../request';
import { Count } from '../count';
import { SdrResource } from '../sdr-resource';
import { SdrCollection } from '../sdr-collection';

@Injectable({
  providedIn: 'root',
})
export abstract class AbstractSdrRepo<R extends SdrResource> implements SdrRepo<R> {
  constructor(@Inject('APP_CONFIG') private appConfig: AppConfig, protected restService: RestService) { }

  public search(request: SdrRequest): Observable<SdrCollection> {
    return this.restService.get<SdrCollection>(`${this.appConfig.serviceUrl}/${this.path()}/search/faceted${this.mapParameters(request)}`, {
      withCredentials: true,
    });
  }

  public count(request: SdrRequest): Observable<Count> {
    return this.restService.get<Count>(`${this.appConfig.serviceUrl}/${this.path()}/search/count${this.mapParameters(request)}`, {
      withCredentials: true,
    });
  }

  public recentlyUpdated(limit: number, filters: Filterable[] = []): Observable<R[]> {
    const parameters = this.mapFilters(filters);
    parameters.push(`limit=${limit}`);
    return this.restService.get<R[]>(`${this.appConfig.serviceUrl}/${this.path()}/search/recently-updated?${parameters.join('&')}`, {
      withCredentials: true,
    });
  }

  public page(request: SdrRequest): Observable<SdrCollection> {
    return this.restService.get<SdrCollection>(`${this.appConfig.serviceUrl}/${this.path()}${this.mapParameters(request)}`, {
      withCredentials: true,
    });
  }

  public getAll(): Observable<SdrCollection> {
    return this.restService.get<SdrCollection>(`${this.appConfig.serviceUrl}/${this.path()}`, {
      withCredentials: true,
    });
  }

  public getOne(id: string | number): Observable<R> {
    return this.restService.get<R>(`${this.appConfig.serviceUrl}/${this.path()}/${id}`, {
      withCredentials: true,
    });
  }

  public findByIdIn(ids: string[]): Observable<SdrCollection> {
    const chunkSize = 100;
    const batches = ids.map((e, i) => (i % chunkSize === 0 ? ids.slice(i, i + chunkSize) : null)).filter((e) => e);
    const observables: Observable<SdrCollection>[] = [];
    batches.forEach((batch) => {
      observables.push(
        this.restService.get<SdrCollection>(`${this.appConfig.serviceUrl}/${this.path()}/search/findByIdIn?ids=${batch.join(',')}`, {
          withCredentials: true,
        })
      );
    });
    return forkJoin(observables).pipe(
      map((resources) => {
        const embedded = {};
        embedded[this.path()] = [];
        const response = {
          _embedded: embedded,
          _links: {
            self: {
              href: `${this.appConfig.serviceUrl}/${this.path()}/search/findByIdIn?ids=${ids.join(',')}`,
            },
          },
          page: {
            size: ids.length,
            totalElements: ids.length,
            totalPages: 1,
            number: 1,
          },
        };
        resources.forEach((result) => {
          response._embedded[this.path()] = response._embedded[this.path()].concat(result._embedded[this.path()]);
        });
        return response;
      })
    );
  }

  public findByTypesIn(types: string[]): Observable<R> {
    return this.restService.get<R>(`${this.appConfig.serviceUrl}/${this.path()}/search/findByTypesIn?types=${types.join(',')}`, {
      withCredentials: true,
    });
  }

  public post(resource: R): Observable<R> {
    return this.restService.post<R>(`${this.appConfig.serviceUrl}/${this.path()}`, resource, { withCredentials: true });
  }

  public put(resource: R): Observable<R> {
    return this.restService.put<R>(resource._links.self.href, resource, {
      withCredentials: true,
    });
  }

  public patch(resource: R): Observable<R> {
    return this.restService.patch<R>(resource._links.self.href, resource, {
      withCredentials: true,
    });
  }

  public delete(resource: R): Observable<string> {
    return this.restService.delete<string>(resource._links.self.href, {
      withCredentials: true,
      responseType: 'text',
    });
  }

  protected mapParameters(request: SdrRequest): string {
    let parameters: string[] = [];

    if (request.page) {
      if (request.page.number) {
        parameters.push(`page=${request.page.number}`);
      }
      if (request.page.size) {
        parameters.push(`size=${request.page.size}`);
      }
      if (request.page.sort && request.page.sort.length > 0) {
        request.page.sort.forEach((sort: Sort) => {
          parameters.push(`sort=${encodeURIComponent(sort.name)},${sort.direction}`);
        });
      }
    }

    if (request.query) {
      if (request.query.expression && request.query.expression.length > 0) {
        parameters.push(`q=${encodeURIComponent(request.query.expression)}`);
      }
      if (request.query.defaultField && request.query.defaultField.length > 0) {
        parameters.push(`df=${request.query.defaultField}`);
      }
    }

    if (request.highlight && request.highlight.fields.length > 0) {
      parameters.push(`hl=${request.highlight.fields.join(',')}`);
      if (request.highlight.prefix && request.highlight.prefix.length > 0) {
        parameters.push(`hl.prefix=${request.highlight.prefix}`);
      }
      if (request.highlight.postfix && request.highlight.postfix.length > 0) {
        parameters.push(`hl.postfix=${request.highlight.postfix}`);
      }
    }

    if (request.filters && request.filters.length > 0) {
      parameters = parameters.concat(this.mapFilters(request.filters));
    }

    if (request.boosts && request.boosts.length > 0) {
      request.boosts.forEach((boost: Boostable) => {
        parameters.push(`boost=${boost.field},${boost.value}`);
      });
    }

    if (request.facets && request.facets.length > 0) {
      parameters = parameters.concat(this.mapFacets(request.facets));
    }

    return `?${parameters.join('&')}`;
  }

  protected abstract path(): string;

  private mapFilters(filters: Filterable[]): string[] {
    const parameters: string[] = [];
    const fields: string[] = [];
    filters.forEach((filter: Filterable) => {
      fields.push(filter.field);
      parameters.push(`${filter.field}.filter=${encodeURIComponent(filter.value)}`);
      parameters.push(`${filter.field}.opKey=${encodeURIComponent(filter.opKey)}`);
    });
    parameters.push(`filters=${encodeURIComponent(fields.join(','))}`);
    return parameters;
  }

  private mapFacets(facets: Facetable[]): string[] {
    const parameters: string[] = [];
    const fields: string[] = [];
    facets.forEach((facet: Facetable) => {
      fields.push(facet.field);
      ['type', 'pageSize', 'pageNumber', 'sort'].forEach((key: string) => {
        if (facet[key]) {
          parameters.push(`${facet.field}.${key}=${facet[key]}`);
        }
      });
      if (facet.filter) {
        parameters.push(`${facet.field}.filter=${encodeURIComponent(facet.filter)}`);
      }
    });
    parameters.push(`facets=${encodeURIComponent(fields.join(','))}`);
    return parameters;
  }
}
