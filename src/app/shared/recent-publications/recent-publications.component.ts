import { Component, ViewChild, ElementRef, AfterViewInit, HostListener, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppState } from '../../core/store';
import * as fromSdr from '../../core/store/sdr/sdr.actions';
import { selectAllResources } from '../../core/store/sdr';
import { Person } from '../../core/model/discovery';
import { environment } from '../../../environments/environment';

interface ScrollItem {
    src: string;
    link: string;
    alt: string;
    hidden: boolean;
}

@Component({
    selector: 'scholars-recent-publications',
    templateUrl: 'recent-publications.component.html',
    styleUrls: ['recent-publications.component.scss']
})
export class RecentPublicationsComponent implements AfterViewInit, OnInit {

    @ViewChild('scrollView') scrollViewRef: ElementRef;

    private items: BehaviorSubject<ScrollItem[]>;
    private persons: Observable<Person[]>;

    constructor(
        private store: Store<AppState>,
        private translate: TranslateService
    ) {
        this.items = new BehaviorSubject<ScrollItem[]>([]);
    }

    ngOnInit() {
        this.persons = this.store.pipe(
            select(selectAllResources('persons')),
            filter((persons: Person[]) => persons.length > 0)
        );

        this.persons.subscribe((persons: Person[]) => {
            this.items.next(persons.map((person: Person) => {
                return {
                    src: person['thumbnail'] ? `${environment.vivoUrl}${person['thumbnail']}` : 'assets/images/default-avatar.png',
                    link: `/display/persons/${person['id']}`,
                    alt: !person['name'] ? person['name'] : this.translate.instant('SHARED.RECENT_PUBLICATIONS.PERSON_IMAGE_ALT_FALLBACK'),
                    hidden: true
                };
            }));
            this.fitItems();
        });

        this.store.dispatch(new fromSdr.RecentlyUpdatedResourcesAction('persons', {limit: 10}));
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

    private fitItems(): void {
        const count = this.getCount();
        const items = this.items.getValue();
        for (let i = 0; i < items.length; i++) {
            items[i].hidden = i >= count;
        }
        this.items.next(items);
    }

    private getCount(): number {
        const size = this.scrollViewRef !== undefined ? this.scrollViewRef.nativeElement.clientWidth : 0;
        return Math.floor(size / 80);
    }

}
