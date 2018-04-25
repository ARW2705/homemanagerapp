import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { baseURL } from '../../shared/baseurl';

import { ProcessHttpmsgProvider } from '../../providers/process-httpmsg/process-httpmsg';

@Injectable()
export class BrewIoProvider {

  constructor(public http: HttpClient,
    private processHttpmsgservice: ProcessHttpmsgProvider) {
    console.log('Hello BrewIoProvider Provider');
  }

  getBrewRoot(id: number): Observable<any> {
    return this.http.get(baseURL + 'brew-roots/' + id)
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  getAllBrewRoots(): Observable<any> {
    return this.http.get(baseURL + 'brew-roots')
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

}
