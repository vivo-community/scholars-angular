import { trigger, style, transition, animate } from '@angular/animations';
import { isPlatformServer } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, HostListener, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AppState } from '../../core/store';
import { AppConfig } from '../../app.config';
import { Person } from '../../core/model/discovery';

import { selectAllResources } from '../../core/store/sdr';

import * as fromSdr from '../../core/store/sdr/sdr.actions';

interface ScrollItem {
    src: string;
    link: string[];
    alt: string;
    hidden: boolean;
}

@Component({
    selector: 'scholars-recent-carousal',
    templateUrl: 'recent-carousal.component.html',
    styleUrls: ['recent-carousal.component.scss'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }), animate('1s ease-out', style({ opacity: 1 }))
            ])
        ])
    ]
})
export class RecentCarousalComponent implements AfterViewInit, OnInit {

    private collection = 'persons';

    private limit = 10;

    @ViewChild('scrollView', { static: true })
    private scrollViewRef: ElementRef;

    private items: BehaviorSubject<ScrollItem[]>;

    private persons: Observable<Person[]>;

    constructor(
        @Inject('APP_CONFIG') private appConfig: AppConfig,
        @Inject(PLATFORM_ID) private platformId: string,
        private store: Store<AppState>,
        private translate: TranslateService
    ) {
        this.items = new BehaviorSubject<ScrollItem[]>([]);
    }

    ngOnInit() {
        this.persons = this.store.pipe(
            select(selectAllResources(this.collection)),
            filter((persons: Person[]) => persons.length > 0)
        );

        this.persons.subscribe((persons: Person[]) => {
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
        });

        this.store.dispatch(new fromSdr.RecentlyUpdatedResourcesAction('persons', { limit: this.limit }));
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
        if (items.length > count - 1) {
            items[count - 1].hidden = true;
            items.unshift(items.pop());
            items[0].hidden = false;
            this.items.next(items);
        }
    }

    public scrollRight(): void {
        const count = this.getCount();
        const items = this.items.getValue();
        if (items.length > count - 1) {
            items[0].hidden = true;
            items.push(items.shift());
            items[count - 1].hidden = false;
            this.items.next(items);
        }
    }

    public getBackgroundImage(item: ScrollItem): string {
        return `linear-gradient(rgba(255,255,255,.15) 70%, rgba(100,100,100,.6) 80%,  rgba(50,50,50,.7) 90%, rgba(0,0,0,.8)), url('${item.src}')`;
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
        return Math.floor(size / 150);
    }

}
