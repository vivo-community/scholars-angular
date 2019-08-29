import { isPlatformBrowser } from '@angular/common';
import { Component, Input, Inject, OnInit, PLATFORM_ID, AfterViewInit, OnDestroy } from '@angular/core';
import { Params, ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

import { AppConfig } from '../../app.config';
import { DisplayTabSectionView, Filter, Sort } from '../../core/model/view';
import { SolrDocument } from '../../core/model/discovery';
import { SdrPage } from '../../core/model/sdr';
import { Direction } from '../../core/model/request';

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
            this.loadBadges();
        }
    }

    ngOnInit() {
        if (this.section.paginated) {
            this.subscriptions.push(this.router.events.pipe(
                filter(event => event instanceof NavigationStart)
            ).subscribe(() => {
                this.loadBadges();
            }));
            const resources = this.getSubsectionCollection(this.document[this.section.field], this.section.filters);
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
        let sorted = [].concat(resources);
        for (const s of sort) {
            const asc = Direction[s.direction] === Direction.ASC;
            sorted = sorted.sort((a, b) => {
                const av = s.date ? new Date(a[s.field]) : a[s.field];
                const bv = s.date ? new Date(b[s.field]) : b[s.field];
                return asc ? (av > bv) ? 1 : ((bv > av) ? -1 : 0) : (bv > av) ? 1 : ((av > bv) ? -1 : 0);
            });
        }
        const pageStart = (page.number - 1) * page.size;
        const pageEnd = pageStart + page.size;
        return sorted.slice(pageStart, pageEnd);
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

    private loadBadges(): void {
        if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
                window['_altmetric_embed_init']();
                window['__dimensions_embed'].addBadges();
            }, 250);
        }
    }

    private getSubsectionCollection(resources: any[], filters: Filter[]): any[] {
        return resources.filter((r) => {
            for (const f of filters) {
                if ((Array.isArray(r[f.field]) ? r[f.field].indexOf(f.value) < 0 : r[f.field] !== f.value)) {
                    return false;
                }
            }
            return true;
        });
    }

}
