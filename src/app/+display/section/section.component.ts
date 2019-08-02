import { Component, Input } from '@angular/core';

import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

import { DisplayTabSectionView } from '../../core/model/view';
import { SolrDocument } from '../../core/model/discovery';

import { environment } from '../../../environments/environment';

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

    public getEmbedSnippet(): string {
        return `<div class="_scholars_embed_" data-collection="${this.collection}" data-individual="${this.document.id}" data-display="${this.display}" data-sections="${this.section.name}"></div>\n\n`
            + '<!-- This JavaScript only needs to be included once in your HTML -->\n'
            + `<script type="text/javascript" src="${environment.serviceUrl}/embed/scholars-embed.min.js" async></script>`;
    }

    public copyToClipBoard(copyElement: any, tooltip: NgbTooltip) {
        copyElement.select();
        document.execCommand('copy');
        copyElement.setSelectionRange(0, 0);
        setTimeout(() => tooltip.close(), 2000);
    }

}
