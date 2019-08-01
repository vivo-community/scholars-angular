import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { User } from '../model/user';
import { LoginRequest, RegistrationRequest } from '../model/request';

import { RestService } from './rest.service';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    constructor(private restService: RestService) {

    }

    public hasSession(): boolean {
        return this.restService.hasSession();
    }

    public clearSession(): void {
        this.restService.clearSession();
    }

    public login(login: LoginRequest): Observable<User> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        const data = `username=${login.email}&password=${login.password}`;
        return this.restService.post<User>(environment.serviceUrl + '/login', data, {
            withCredentials: true,
            headers
        });
    }

    public logout(): Observable<string> {
        return this.restService.get<string>(environment.serviceUrl + '/logout', {
            withCredentials: true,
            responseType: 'text'
        });
    }

    public submitRegistration(registration: RegistrationRequest): Observable<RegistrationRequest> {
        return this.restService.post<RegistrationRequest>(environment.serviceUrl + '/registration', registration);
    }

    public completeRegistration(registration: RegistrationRequest): Observable<User> {
        return this.restService.put<User>(environment.serviceUrl + '/registration', registration);
    }

    public confirmRegistration(key: string): Observable<RegistrationRequest> {
        return this.restService.get<RegistrationRequest>(environment.serviceUrl + '/registration?key=' + key);
    }

    public getUser(): Observable<User> {
        return this.restService.get<User>(environment.serviceUrl + '/user', {
            withCredentials: true
        });
    }

}
