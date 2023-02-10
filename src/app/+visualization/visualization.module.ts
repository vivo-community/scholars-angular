import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../shared/shared.module';

import { CustomMissingTranslationHandler } from '../core/handler/custom-missing-translation.handler';

import { VisualizationComponent } from './visualization.component';

import { ChordDiagramComponent } from './chord-diagram/chord-diagram.component';
import { CoAuthorNetworkComponent } from './co-author-network/co-author-network.component';
import { CoInvestigatorNetworkComponent } from './co-investigator-network/co-investigator-network.component';
import { routes } from './visualization.routes';

@NgModule({
  declarations: [
    VisualizationComponent,
    ChordDiagramComponent,
    CoAuthorNetworkComponent,
    CoInvestigatorNetworkComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule.forChild({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: CustomMissingTranslationHandler,
      },
      isolate: false,
    }),
    RouterModule.forChild(routes),
  ],
})
export class VisualizationModule {

  public static routes = routes;

}
