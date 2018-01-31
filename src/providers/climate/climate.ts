import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Climate } from '../../shared/climate';
import { baseURL } from '../../shared/baseurl';

@Injectable()
export class ClimateProvider {

  constructor(private http: HttpClient) {
    console.log('Hello ClimateProvider Provider');
  }

  getCurrentClimateData(): Observable<any> {
    return this.http.get(baseURL + 'climate');
  }

  getClimatePrograms(): Observable<any> {
    return this.http.get(baseURL + 'climate/programs');
  }

  // TODO implement CRUD operations for climate programs

}
