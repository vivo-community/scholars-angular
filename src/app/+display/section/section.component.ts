import { Component, Input } from '@angular/core';

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
    public displayViewName: String;

    @Input()
    public collection: String;


    public buildEmbedCode(): String {
		return '<div class="scholars-embed" data-id="'+this.document.id+'" data-collection="'+this.collection+'" data-displayview="'+this.displayViewName+'" data-sections="'+this.section.name+'"></div>'+
			   '<!-- This javascript only needs to be included once in your HTML -->'+
			   '<script type="text/javascript" src="'+environment.service+'/js/embed/dist/bundle.js" async></script>';
    }

    public copyToClipBoard(copyElement: any) {
	    copyElement.select();
	    document.execCommand('copy');
	    copyElement.setSelectionRange(0, 0);
    }
}
