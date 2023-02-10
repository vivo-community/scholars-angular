import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { VisualizationModule } from '../visualization.module';
import { ChordDiagramComponent } from './chord-diagram.component';

describe('ChordDiagramComponent', () => {
  let component: ChordDiagramComponent;
  let fixture: ComponentFixture<ChordDiagramComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        VisualizationModule
      ],
      providers: [
        TranslateService
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChordDiagramComponent);
    component = fixture.componentInstance;
    component.dataNetwork = {
      id: 'n00000001',
      lookup: new Map<string, string>(),
      linkCounts: new Map<string, number>(),
      yearCounts: new Map<string, number>(),
      data: []
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
