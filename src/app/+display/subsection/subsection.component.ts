import { Component, Inject, PLATFORM_ID, Input, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router, NavigationStart } from '@angular/router';

import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { Sort } from '../../core/model/view';
import { SolrDocument } from '../../core/model/discovery';
import { Subsection } from '../../core/model/view/display-view';
import { SdrPage } from '../../core/model/sdr';
import { getResourcesPage, getSubsectionResources, loadBadges } from '../../shared/utilities/view.utility';

@Component({
    selector: 'scholars-subsection',
    templateUrl: './subsection.component.html',
    styleUrls: ['./subsection.component.scss']
})
export class SubsectionComponent implements AfterViewInit, OnInit, OnDestroy {

    @Input()
    public subsection: Subsection;

    @Input()
    public document: SolrDocument;

    public resources: BehaviorSubject<any[]>;

    public page: Observable<SdrPage>;

    public pageSizeOptions = [5, 10, 25, 50, 100, 500, 1000];

    private subscriptions: Subscription[];

    constructor(
        @Inject(PLATFORM_ID) private platformId: string,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.resources = new BehaviorSubject<any[]>([]);
        this.subscriptions = [];
    }

    ngAfterViewInit() {
        loadBadges(this.platformId);
    }

    ngOnInit() {
        this.subscriptions.push(this.router.events.pipe(
            filter(event => event instanceof NavigationStart)
        ).subscribe(() => {
            loadBadges(this.platformId);
        }));
        const resources = getSubsectionResources(this.document[this.subsection.field], this.subsection.filters);
        this.page = this.route.queryParams.pipe(
            map((params: Params) => {
                const pageSize = params[`${this.subsection.name}.size`] ? Number(params[`${this.subsection.name}.size`]) : this.subsection.pageSize;
                const pageNumber = params[`${this.subsection.name}.page`] ? Number(params[`${this.subsection.name}.page`]) : 1;
                const totalElements = this.resources.getValue().length;
                return {
                    size: pageSize,
                    totalElements: totalElements,
                    totalPages: Math.ceil(totalElements / pageSize),
                    number: pageNumber,
                };
            })
        );
        this.resources.next(resources);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    }

    public getResources(): Observable<any[]> {
        return this.resources.asObservable();
    }

    public getResourcesPage(resources: any[], sort: Sort[], page: SdrPage): any[] {
        return getResourcesPage(resources, sort, page);
    }

}
