import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { baseURL } from '../../shared/baseurl';

@Injectable()
export class ClimateProvider {

  desiredTemperature: number = 70;

  constructor(private http: HttpClient) {
    console.log('Hello ClimateProvider Provider');
  }

  getDesiredTemperature(): number {
    return this.desiredTemperature;
  }

  updateDesiredTemperature(temperature: number) {
    this.desiredTemperature = temperature;
  }

  getCurrentClimateData(): Observable<any> {
    return this.http.get(baseURL + 'climate');
  }

  getClimatePrograms(): Observable<any> {
    return this.http.get(baseURL + 'climateprograms');
  }

  // TODO implement CRUD operations for climate programs

}
