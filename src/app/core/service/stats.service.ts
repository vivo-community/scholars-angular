import { Inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { AppConfig, APP_CONFIG } from 'src/app/app.config';
import { RestService } from './rest.service';

@Injectable()
export class StatsService {

  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private rest: RestService) {

  }

  public collect(queryParams: Params): Observable<any> {
    return new Observable((observer) => {
      if (this.appConfig.collectSearchStats) {
        this.rest.get('https://php.library.tamu.edu/utilities/vivo_page_info.php').toPromise().then((data: any) => {
          data.queryParams = queryParams;
          this.rest.post('https://scholars.library.tamu.edu/vivo_editor/insert_stat.php', data, {
            responseType: 'text'
          }).toPromise().then((res: any) => {
            observer.next(data);
            observer.complete();
          }).catch(err => {
            observer.error(err);
            observer.complete();
          });
        }).catch(err => {
          observer.error(err);
          observer.complete();
        });
      } else {
        observer.next(false);
        observer.complete();
      }
    });
  }

}
