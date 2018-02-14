import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import { baseURL } from '../../shared/baseurl';
import { GarageDoor } from '../../shared/garagedoor';

import { ProcessHttpmsgProvider } from '../process-httpmsg/process-httpmsg';

@Injectable()
export class GarageDoorProvider {

  constructor(public http: HttpClient,
    private processHttpmsgservice: ProcessHttpmsgProvider) {
    console.log('Hello GarageDoorProvider Provider');
  }

  getGarageDoorStatus(): Observable<any> {
    return this.http.get(baseURL + 'garagedoor')
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  operateGarageDoor(action: string) {
    return this.http.patch(baseURL + 'garagedoor', {targetPosition: action})
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

}
