import { Component, Input, Inject } from '@angular/core';

import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

import { AppConfig } from '../../app.config';
import { DisplayTabSectionView } from '../../core/model/view';
import { SolrDocument } from '../../core/model/discovery';

@Component({
    selector: 'scholars-section',
    templateUrl: './section.component.html',
    styleUrls: ['./section.component.scss']
})
export class SectionComponent {

    @Input()
    public section: DisplayTabSectionView;

    @Input()
    public document: SolrDocument;

    @Input()
    public display: string;

    @Input()
    public collection: string;

    constructor(@Inject('APP_CONFIG') private appConfig: AppConfig) {

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
