import { Injectable, Inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { AppConfig, APP_CONFIG } from '../../app.config';
import { User } from '../model/user';
import { LoginRequest, RegistrationRequest } from '../model/request';

import { RestService } from './rest.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private restService: RestService) {}

  public hasSession(): boolean {
    return this.restService.hasSession();
  }

  public clearSession(): void {
    this.restService.clearSession();
  }

  public login(login: LoginRequest): Observable<User> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const data = `username=${login.email}&password=${login.password}`;
    return this.restService.post<User>(this.appConfig.serviceUrl + '/login', data, {
      withCredentials: true,
      headers,
    });
  }

  public logout(): Observable<string> {
    return this.restService.get<string>(this.appConfig.serviceUrl + '/logout', {
      withCredentials: true,
      responseType: 'text',
    });
  }

  public submitRegistration(registration: RegistrationRequest): Observable<RegistrationRequest> {
    return this.restService.post<RegistrationRequest>(this.appConfig.serviceUrl + '/registration', registration);
  }

  public confirmRegistration(key: string): Observable<RegistrationRequest> {
    return this.restService.get<RegistrationRequest>(this.appConfig.serviceUrl + '/registration?key=' + key);
  }

  public completeRegistration(key: string, registration: RegistrationRequest): Observable<User> {
    return this.restService.put<User>(this.appConfig.serviceUrl + '/registration?key=' + key, registration);
  }

  public getUser(): Observable<User> {
    return this.restService.get<User>(this.appConfig.serviceUrl + '/user', {
      withCredentials: true,
    });
  }
}
