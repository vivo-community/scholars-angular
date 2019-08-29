import { trigger, style, transition, animate } from '@angular/animations';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, HostListener, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { AppState } from '../../core/store';
import { AppConfig } from '../../app.config';
import { Person } from '../../core/model/discovery';

import { selectResourcesRecentlyUpdated } from '../../core/store/sdr';

import * as fromSdr from '../../core/store/sdr/sdr.actions';
import { OpKey } from '../../core/model/view';

interface ScrollItem {
    src: string;
    link: string[];
    alt: string;
    hidden: boolean;
}

@Component({
    selector: 'scholars-recent-carousel',
    templateUrl: 'recent-carousel.component.html',
    styleUrls: ['recent-carousel.component.scss'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }), animate('1s ease-out', style({ opacity: 1 }))
            ])
        ])
    ]
})
export class RecentCarouselComponent implements AfterViewInit, OnInit, OnDestroy {

    private collection = 'persons';

    private limit = 20;

    private delay = 10000;

    @ViewChild('scrollView', { static: true })
    private scrollViewRef: ElementRef;

    private items: BehaviorSubject<ScrollItem[]>;

    private persons: Observable<Person[]>;

    private subscriptions: Subscription[];

    constructor(
        @Inject('APP_CONFIG') private appConfig: AppConfig,
        @Inject(PLATFORM_ID) private platformId: string,
        private store: Store<AppState>,
        private translate: TranslateService
    ) {
        this.items = new BehaviorSubject<ScrollItem[]>([]);
        this.subscriptions = [];
    }

    ngOnInit() {
        this.persons = this.store.pipe(
            select(selectResourcesRecentlyUpdated(this.collection)),
            filter((persons: Person[]) => persons.length > 0)
        );
        this.subscriptions.push(this.persons.subscribe((persons: Person[]) => {
            this.items.next(persons.map((person: Person) => {
                return {
                    src: person['thumbnail'] ? `${this.appConfig.vivoUrl}${person['thumbnail']}` : 'assets/images/default-avatar.png',
                    link: [`display/persons/${person['id']}`],
                    alt: person['firstName'] ? person['firstName'] + (person['lastName'] ? ' ' + person['lastName'] : '') : this.translate.instant('SHARED.RECENT_PUBLICATIONS.PERSON_IMAGE_ALT_FALLBACK'),
                    modTime: person['modTime'] ? person['modTime'] : '',
                    name: person['firstName'] ? person['firstName'] + (person['lastName'] ? ' ' + person['lastName'] : '') : '',
                    preferredTitle: person['preferredTitle'] ? person['preferredTitle'] : '',
                    hidden: true
                };
            }));
            this.fitItems();
            if (isPlatformBrowser(this.platformId)) {
                this.subscriptions.push(timer(this.delay, this.delay).pipe(take(100)).subscribe(() => this.scrollRight()));
            }
        }));
        this.store.dispatch(new fromSdr.RecentlyUpdatedResourcesAction(this.collection, {
            limit: this.limit, filters: [{
                field: 'featuredProfileDisplay',
                value: 'true',
                opKey: OpKey.EQUALS
            }]
        }));
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    }

    ngAfterViewInit() {
        setTimeout(() => this.fitItems());
    }

    @HostListener('window:resize', ['$event'])
    public onResize() {
        this.fitItems();
    }

    public getItems(): Observable<ScrollItem[]> {
        return this.items.asObservable();
    }

    public scrollLeft(): void {
        const count = this.getCount();
        const items = this.items.getValue();
        if (count > 0 && items.length > count - 1) {
            items[count - 1].hidden = true;
            items.unshift(items.pop());
            items[0].hidden = false;
            this.items.next(items);
        }
    }

    public scrollRight(): void {
        const count = this.getCount();
        const items = this.items.getValue();
        if (count > 0 && items.length > count - 1) {
            items[0].hidden = true;
            items.push(items.shift());
            items[count - 1].hidden = false;
            this.items.next(items);
        }
    }

    public getBackgroundImage(item: ScrollItem): string {
        return `linear-gradient(rgba(255,255,255,.15) 60%, rgba(100,100,100,.6) 70%,  rgba(50,50,50,.7) 80%, rgba(0,0,0,.8)), url('${item.src}')`;
    }

    private fitItems(): void {
        const count = this.getCount();
        const items = this.items.getValue();
        for (let i = 0; i < items.length; i++) {
            items[i].hidden = i >= count;
        }
        this.items.next(items);
    }

    private getCount(): number {
        // NOTE: the server does not know the width of your browser, best to no render any cards and fade in
        if (isPlatformServer(this.platformId)) {
            return 0;
        }
        const size = this.scrollViewRef !== undefined ? this.scrollViewRef.nativeElement.clientWidth : 0;
        return Math.floor(size / 100);
    }

}
