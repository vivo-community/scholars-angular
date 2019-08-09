import { inject, TestBed } from '@angular/core/testing';

import { StompService } from './stomp.service';

describe('StompService', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                StompService,
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
        });
    });

    it('should be created', inject([StompService], (service: StompService) => {
        expect(service).toBeTruthy();
    }));

});
