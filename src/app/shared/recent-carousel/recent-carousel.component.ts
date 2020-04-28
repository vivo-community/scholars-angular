import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, HostListener, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AppState } from '../../core/store';
import { AppConfig } from '../../app.config';

import { OpKey } from '../../core/model/view';
import { Individual } from '../../core/model/discovery';
import { fadeIn } from '../utilities/animation.utility';

import { selectResourcesRecentlyUpdated } from '../../core/store/sdr';

import * as fromSdr from '../../core/store/sdr/sdr.actions';

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
  animations: [fadeIn],
})
export class RecentCarouselComponent implements AfterViewInit, OnInit, OnDestroy {
  private limit = 20;

  private interval = 10000;

  @ViewChild('scrollView', { static: true })
  private scrollViewRef: ElementRef;

  private items: BehaviorSubject<ScrollItem[]>;

  private individuals: Observable<Individual[]>;

  private subscriptions: Subscription[];

  constructor(@Inject('APP_CONFIG') private appConfig: AppConfig, @Inject(PLATFORM_ID) private platformId: string, private store: Store<AppState>, private translate: TranslateService) {
    this.items = new BehaviorSubject<ScrollItem[]>([]);
    this.subscriptions = [];
  }

  ngOnInit() {
    this.individuals = this.store.pipe(
      select(selectResourcesRecentlyUpdated('individual')),
      filter((individuals: Individual[]) => individuals.length > 0)
    );
    this.subscriptions.push(
      this.individuals.subscribe((individuals: Individual[]) => {
        this.items.next(
          individuals.map((individual: Individual) => {
            return {
              // tslint:disable: no-string-literal
              src: individual['thumbnail'] ? individual['thumbnail'] : 'assets/images/default-avatar.png',
              link: [`display/${individual['id']}`],
              alt: individual['firstName'] ? individual['firstName'] + (individual['lastName'] ? ' ' + individual['lastName'] : '') : this.translate.instant('SHARED.RECENT_PUBLICATIONS.PERSON_IMAGE_ALT_FALLBACK'),
              modTime: individual['modTime'] ? individual['modTime'] : '',
              name: individual['firstName'] ? individual['firstName'] + (individual['lastName'] ? ' ' + individual['lastName'] : '') : '',
              preferredTitle: individual['preferredTitle'] ? individual['preferredTitle'] : '',
              hidden: true,
              // tslint:enable: no-string-literal
            };
          })
        );
        this.fitItems();
        if (isPlatformBrowser(this.platformId)) {
          this.subscriptions.push(interval(this.interval).subscribe(() => this.scrollRight()));
        }
      })
    );
    this.store.dispatch(
      new fromSdr.RecentlyUpdatedResourcesAction('individual', {
        limit: this.limit,
        filters: [
          {
            field: 'class',
            value: 'Person',
            opKey: OpKey.EQUALS,
          },
          {
            field: 'featuredProfileDisplay',
            value: 'true',
            opKey: OpKey.EQUALS,
          },
        ],
      })
    );
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
