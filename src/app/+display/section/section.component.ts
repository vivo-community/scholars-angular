import { Component, Input, Inject, OnInit, PLATFORM_ID, AfterViewInit, OnDestroy } from '@angular/core';
import { Params, ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

import { AppConfig } from '../../app.config';
import { DisplayTabSectionView, Sort } from '../../core/model/view';
import { SolrDocument } from '../../core/model/discovery';
import { SdrPage } from '../../core/model/sdr';
import { getResourcesPage, getSubsectionResources, loadBadges } from '../../shared/utilities/view.utility';

@Component({
    selector: 'scholars-section',
    templateUrl: './section.component.html',
    styleUrls: ['./section.component.scss']
})
export class SectionComponent implements AfterViewInit, OnInit, OnDestroy {

    @Input()
    public section: DisplayTabSectionView;

    @Input()
    public document: SolrDocument;

    @Input()
    public display: string;

    @Input()
    public collection: string;

    public resources: BehaviorSubject<any[]>;

    public page: Observable<SdrPage>;

    public pageSizeOptions = [5, 10, 25, 50, 100, 500, 1000];

    private subscriptions: Subscription[];

    constructor(
        @Inject('APP_CONFIG') private appConfig: AppConfig,
        @Inject(PLATFORM_ID) private platformId: string,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.resources = new BehaviorSubject<any[]>([]);
        this.subscriptions = [];
    }

    ngAfterViewInit() {
        if (this.section.paginated) {
            loadBadges(this.platformId);
        }
    }

    ngOnInit() {
        if (this.section.paginated) {
            this.subscriptions.push(this.router.events.pipe(
                filter(event => event instanceof NavigationStart)
            ).subscribe(() => {
                loadBadges(this.platformId);
            }));
            const resources = getSubsectionResources(this.document[this.section.field], this.section.filters);
            this.page = this.route.queryParams.pipe(
                map((params: Params) => {
                    const pageSize = params[`${this.section.name}.size`] ? Number(params[`${this.section.name}.size`]) : this.section.pageSize;
                    const pageNumber = params[`${this.section.name}.page`] ? Number(params[`${this.section.name}.page`]) : 1;
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

    public getEmbedSnippet(): string {
        return `<div class="_scholars_embed_" data-collection="${this.collection}" data-individual="${this.document.id}" data-display="${this.display}" data-sections="${this.section.name}"></div>\n\n`
            + '<!-- This JavaScript only needs to be included once in your HTML -->\n'
            + `<script type="text/javascript" src="${this.appConfig.embedUrl}/scholars-embed.min.js" async></script>`;
    }

    public copyToClipBoard(copyElement: any, tooltip: NgbTooltip) {
        copyElement.select();
        document.execCommand('copy');
        copyElement.setSelectionRange(0, 0);
        setTimeout(() => tooltip.close(), 2000);
    }

}
