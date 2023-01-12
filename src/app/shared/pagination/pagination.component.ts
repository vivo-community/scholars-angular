import { APP_BASE_HREF } from '@angular/common';
import { Component, Input, OnInit, Inject } from '@angular/core';
import { Params, Router, ActivatedRoute } from '@angular/router';

import { Store, select } from '@ngrx/store';

import { Observable } from 'rxjs';

import { v4 as uuidv4 } from 'uuid';

import { pagination } from 'scholars-embed-utilities';

import { AppState } from '../../core/store';

import { SdrPage } from '../../core/model/sdr';
import { WindowDimensions } from '../../core/store/layout/layout.reducer';

import { selectWindowDimensions } from '../../core/store/layout';

@Component({
  selector: 'scholars-pagination',
  templateUrl: 'pagination.component.html',
  styleUrls: ['pagination.component.scss'],
})
export class PaginationComponent implements OnInit {
  @Input()
  public page: Observable<SdrPage>;

  @Input()
  public size: 'sm' | 'lg';

  @Input()
  public queryPrefix: string;

  @Input()
  public pageSizeOptions = [10, 25, 50, 100];

  @Input()
  public pageSizeOptionsType: 'list' | 'dropdown' = 'dropdown';

  public windowDimensions: Observable<WindowDimensions>;

  public id: string;

  constructor(@Inject(APP_BASE_HREF) private baseHref: string, private store: Store<AppState>, private router: Router, private route: ActivatedRoute) {
    this.id = uuidv4();
  }

  ngOnInit() {
    this.windowDimensions = this.store.pipe(select(selectWindowDimensions));
  }

  public getPages(page: SdrPage, windowDimensions: WindowDimensions): number[] {
    return pagination(page, windowDimensions);
  }

  public hasPrevious(pageNumber: number): boolean {
    return pageNumber > 1;
  }

  public hasNext(pageNumber: number, totalPages: number): boolean {
    return pageNumber < totalPages;
  }

  public nextDisabled(pageNumber: number, totalPages: number): boolean {
    return !this.hasNext(pageNumber, totalPages);
  }

  public previousDisabled(pageNumber: number): boolean {
    return !this.hasPrevious(pageNumber);
  }

  public isEllipsis(pageNumber: number): boolean {
    return pageNumber === -1;
  }

  public buildUrl(page: number, size: number): string {
    const params: Params = {};
    params[this.queryPrefix && this.queryPrefix.length > 0 ? `${this.queryPrefix}.page` : 'page'] = page;
    params[this.queryPrefix && this.queryPrefix.length > 0 ? `${this.queryPrefix}.size` : 'size'] = size;
    const urlTree = this.router.createUrlTree(['.'], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
    const path = this.router.serializeUrl(urlTree);
    return `${this.baseHref}${path.substring(1)}#${this.id}`;
  }
}
