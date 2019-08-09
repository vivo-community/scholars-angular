import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayModule } from '../display.module';

import { SectionComponent } from './section.component';

describe('SectionComponent', () => {
    let component: SectionComponent;
    let fixture: ComponentFixture<SectionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                DisplayModule
            ],
            providers: [
                {
                    provide: 'APP_CONFIG', useValue: {
                        host: 'localhost',
                        port: 4200,
                        baseHref: '/',
                        serviceUrl: 'http://localhost:9000',
                        vivoUrl: 'https://scholars.library.tamu.edu/vivo',
                        vivoEditorUrl: 'https://scholars.library.tamu.edu/vivo_editor'
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SectionComponent);
        component = fixture.componentInstance;
        component.section = {
            name: 'Test',
            template: '',
            templateFunction: (resource: any) => '',
            requiredFields: [],
            lazyReferences: [],
            subsections: [],
            hidden: false,
            shared: false
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
