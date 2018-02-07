import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Events } from 'ionic-angular';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/catch';

import { baseURL } from '../../shared/baseurl';
import { ProcessHttpmsgProvider } from '../process-httpmsg/process-httpmsg';

interface AuthResponse {
  status: string,
  success: string,
  token: string
};

interface JWTResponse {
  status: string,
  success: string,
  user: any
};

@Injectable()
export class AuthenticationProvider {

  tokenKey: string = 'JWT';
  isAuthenticated: boolean = false;
  username: Subject<string> = new Subject<string>();
  authToken: string = undefined;

  constructor(public http: HttpClient,
    private processHttpmsgService: ProcessHttpmsgProvider,
    private storage: Storage,
    public events: Events) {
    console.log('Hello AuthenticationProvider Provider');
  }

  checkJWTtoken() {
    this.http.get<JWTResponse>(baseURL + 'users/checkJWTtoken')
      .subscribe(res => {
        console.log("JWT Token Valid: ", res);
        this.sendUsername(res.user.username);
        this.events.publish('user:authed');
      },
      err => {
        console.log("JWT Token Invalid: ", err);
        this.destroyUserCredentials();
        this.events.publish('user:not-authed');
      });
  }

  sendUsername(name: string) {
    this.username.next(name);
  }

  clearUsername() {
    this.username.next(undefined);
  }

  getUsername(): Observable<string> {
    return this.username.asObservable();
  }

  getToken(): string {
    return this.authToken;
  }

  loadUserCredentials() {
     this.storage.get(this.tokenKey)
      .then(key => {
        if (key) {
          const credentials = JSON.parse(key);
          console.log("Loaded user credentials: ", credentials);
          if (credentials && credentials.username != undefined) {
            this.useCredentials(credentials);
            if (this.authToken) {
              this.checkJWTtoken();
            }
          }
        } else {
          console.log("Token key not defined");
          this.events.publish('user:not-authed');
        }
      });
  }

  storeUserCredentials(credentials: any) {
    console.log("Storing user credentials", credentials);
    this.storage.set(this.tokenKey, JSON.stringify(credentials));
    this.useCredentials(credentials);
  }

  useCredentials(credentials: any) {
    this.isAuthenticated = true;
    this.sendUsername(credentials.username);
    this.authToken = credentials.token;
  }

  destroyUserCredentials() {
    this.authToken = undefined;
    this.clearUsername();
    this.isAuthenticated = false;
    this.storage.remove(this.tokenKey);
  }

  logIn(user: any): Observable<any> {
    return this.http.post<AuthResponse>(baseURL + 'users/login',
      {"username": user.username, "password": user.password})
      .map(res => {
        this.storeUserCredentials({username: user.username, token: res.token});
        return {'success': true, 'username': user.username};
      })
      .catch(err => this.processHttpmsgService.handleError(err));
  }

  logOut() {
    this.destroyUserCredentials();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

}
