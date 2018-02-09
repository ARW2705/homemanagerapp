import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

@Injectable()
export class ProcessHttpmsgProvider {

  constructor(public http: HttpClient) {
    console.log('Hello ProcessHttpmsgProvider Provider');
  }

  public handleError(error: HttpErrorResponse | any) {
    let errMsg: string;

    if (error instanceof HttpErrorResponse) {
      const errStatus = (error.status) ? error.status: 503;
      const errStatusText = (error.status) ? error.statusText: 'Service Unavailable';
      errMsg = `${errStatus} - ${errStatusText || ''}`;
    } else {
      errMsg = error.message ? error.message: error.toString();
    }
    console.log(errMsg);
    return Observable.throw(errMsg);
  }

}
