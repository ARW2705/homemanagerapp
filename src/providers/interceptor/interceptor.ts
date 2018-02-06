import { HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

import { AuthenticationProvider } from '../authentication/authentication';

@Injectable()
export class AuthorizedInterceptor implements HttpInterceptor {

  constructor(private inj: Injector) {
    console.log('Hello AuthorizedInterceptor Provider');
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authService = this.inj.get(AuthenticationProvider);
    const authToken = authService.getToken();
    const authReq = req.clone({headers: req.headers.set('Authorization', `bearer ${authToken}`)});
    return next.handle(authReq);
  }

}

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {

  constructor(private inj: Injector) {
    console.log('Hello UnauthorizedInterceptor Provider');
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authService = this.inj.get(AuthenticationProvider);
    const authToken = authService.getToken();

    return next
      .handle(req)
      .do((event: HttpEvent<any>) => {
        // do nothing
      }, (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401 && authToken) {
            console.log("Unauthorized Interceptor: ", err);
            authService.checkJWTtoken();
          }
        }
      });
  }
}
