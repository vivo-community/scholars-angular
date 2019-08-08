import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Params, Router, NavigationStart } from '@angular/router';
import { Store } from '@ngrx/store';

import { scheduled, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { queue } from 'rxjs/internal/scheduler/queue';

import { AppState } from '../../../core/store';
import { DialogButtonType, DialogControl } from '../../../core/model/dialog';
import { Facet, FacetType } from '../../../core/model/view';
import { SdrFacet } from '../../../core/model/sdr';

import * as fromDialog from '../../../core/store/dialog/dialog.actions';

@Component({
    selector: 'scholars-facet-entries',
    templateUrl: './facet-entries.component.html',
    styleUrls: ['./facet-entries.component.scss']
})
export class FacetEntriesComponent implements OnDestroy, OnInit {

    @Input() facet: Facet;

    @Input() sdrFacet: SdrFacet;

    public page = 2;

    public size = 10;

    public routerLink = [];

    public dialog: DialogControl;

    private subscriptions: Subscription[];

    constructor(
        private router: Router,
        private store: Store<AppState>,
        private translate: TranslateService
    ) {
        this.subscriptions = [];
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
    }

    ngOnInit() {
        this.subscriptions.push(this.router.events.pipe(
            filter(event => event instanceof NavigationStart)
        ).subscribe(() => {
            this.store.dispatch(new fromDialog.CloseDialogAction());
        }));
        this.dialog = {
            title: scheduled([this.facet.name], queue),
            close: {
                type: DialogButtonType.OUTLINE_WARNING,
                label: this.translate.get('SHARED.DIALOG.FACET_ENTRIES.CANCEL'),
                action: () => this.store.dispatch(new fromDialog.CloseDialogAction()),
                disabled: () => scheduled([false], queue)
            }
        };
    }

    public getFacetEntryPage(): any[] {
        const start = (this.page - 1) * this.size;
        return this.sdrFacet.entries.slice(start, start + this.size);
    }

    public getQueryParams(entry: any): Params {
        const queryParams: Params = {};
        if (this.facet.type === FacetType.DATE_YEAR) {
            queryParams[`${this.sdrFacet.field}.filter`] = `[${entry.value - 1} TO ${entry.value}]`;
        } else {
            queryParams[`${this.sdrFacet.field}.filter`] = entry.value;
        }
        return queryParams;
    }

}
