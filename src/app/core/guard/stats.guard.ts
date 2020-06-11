import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Params } from '@angular/router';
import { RestService } from '../service/rest.service';
import { Observable, of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';

@Injectable()
export class StatsGuard implements CanActivate {

  constructor(
    @Inject('APP_CONFIG') private appConfig: AppConfig,
    private rest: RestService
  ) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (this.appConfig.collectSearchStats) {
      this.rest.get('https://php.library.tamu.edu/utilities/vivo_page_info.php').toPromise().then((data: {
        client_ip: string, referer: string, queryParams: Params
      }) => {
        data.queryParams = route.queryParams;
        this.rest.post('https://scholars.library.tamu.edu/vivo_editor/insert_stat.php', data, {
          responseType: 'text'
        }).toPromise().catch(err => {
          console.error(err);
        });
      }).catch(err => {
        console.error(err);
      });
    }
    return of(true);
  }

}
