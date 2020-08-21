import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformServer } from '@angular/common';

import { Observable, Observer, scheduled } from 'rxjs';
import { asapScheduler } from 'rxjs';

// import * as Stomp from 'stompjs';
// import * as SockJS from 'sockjs-client';

import { AppConfig, APP_CONFIG } from '../../app.config';
import { StompSubscription } from '../model/stomp';

// import { environment } from '../../../environments/environment';

// NOTE: Commented out any reference to sockjs-client and stompjs.
// They have been removed due to being built with commonjs and causes
// optimization bailouts. Can be reintroduced when they are updated.

@Injectable({
  providedIn: 'root',
})
export class StompService {

  private client: any;

  private pending: Map<string, { observer: Observer<StompSubscription>; subscription: StompSubscription }>;

  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, @Inject(PLATFORM_ID) private platformId: string) {
    this.pending = new Map<string, { observer: Observer<StompSubscription>; subscription: StompSubscription }>();
  }

  public connect(): Observable<any> {
    // if (isPlatformServer(this.platformId)) {
    //   return scheduled([false], asapScheduler);
    // }
    // const socket = new SockJS(this.appConfig.serviceUrl + '/connect');
    // this.client = Stomp.over(socket);

    // this.client.onreceipt = (receipt: any): void => {
    //   if (typeof receipt === 'object') {
    //     if (receipt.headers.destination) {
    //       const channel = receipt.headers.destination;
    //       const pending = this.pending.get(channel);
    //       if (pending) {
    //         pending.observer.next(pending.subscription);
    //         pending.observer.complete();
    //         this.pending.delete(channel);
    //       }
    //     }
    //   }
    // };

    // this.client.debug = (frame: any): void => {
    //   if (environment.stompDebug) {
    //     console.log(frame);
    //   }
    // };

    // const headers = {};
    // return new Observable((observer) => {
    //   this.client.connect(
    //     headers,
    //     (frame) => {
    //       observer.next(frame);
    //       observer.complete();
    //     },
    //     (error) => {
    //       if (typeof error === 'object') {
    //         if (error.headers.destination) {
    //           const channel = error.headers.destination;
    //           const pending = this.pending.get(channel);
    //           if (pending) {
    //             pending.observer.error(error);
    //             pending.observer.complete();
    //             this.pending.delete(channel);
    //           }
    //         }
    //       }
    //     }
    //   );
    // });
    return scheduled([false], asapScheduler);
  }

  public disconnect(): Observable<any> {
    // if (isPlatformServer(this.platformId)) {
    //   return scheduled([false], asapScheduler);
    // }
    // return new Observable((observer) => {
    //   if (this.client !== undefined) {
    //     this.client.disconnect(
    //       (frame) => {
    //         observer.next(frame);
    //         observer.complete();
    //       },
    //       (error) => {
    //         observer.error(error);
    //         observer.complete();
    //       }
    //     );
    //   } else {
    //     observer.next('Not connected!');
    //     observer.complete();
    //   }
    // });
    return scheduled([false], asapScheduler);
  }

  public subscribe(channel: string, callback: () => {}): Observable<any> {
    // if (isPlatformServer(this.platformId)) {
    //   return scheduled([false], asapScheduler);
    // }
    // return new Observable((observer) => {
    //   this.pending.set(channel, {
    //     observer,
    //     subscription: this.client.subscribe(channel, callback, {
    //       receipt: `receipt-${Object.keys(this.pending).length}`,
    //     }),
    //   });
    // });
    return scheduled([false], asapScheduler);
  }

  public unsubscribe(id: string): Observable<any> {
    // return scheduled([this.client.unsubscribe(id)], asapScheduler);
    return scheduled([false], asapScheduler);
  }

}
