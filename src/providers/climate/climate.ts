import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import { ProcessHttpmsgProvider } from '../process-httpmsg/process-httpmsg';
import { baseURL } from '../../shared/baseurl';

@Injectable()
export class ClimateProvider {

  desiredTemperature: number;

  constructor(private http: HttpClient,
    private processHttpmsgservice: ProcessHttpmsgProvider) {
    console.log('Hello ClimateProvider Provider');
  }

  getDesiredTemperature(): number {
    return this.desiredTemperature;
  }

  setDesiredTemperature(temperature: number) {
    this.desiredTemperature = temperature;
  }

  getCurrentClimateData(): Observable<any> {
    return this.http.get(baseURL + 'climate')
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  getClimatePrograms(): Observable<any> {
    return this.http.get(baseURL + 'climateprograms')
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  updateClimateParameters(temperature: number = null,
    operatingStatus: string = null,
    selectedProgramId: number = null): Observable<any> {
    this.setDesiredTemperature(temperature);
    const payload:any = {};
    let destination;
    if (temperature) {
      payload.temperature = temperature;
      destination = 'climate';
    } else if (operatingStatus) {
      payload.operatingStatus = operatingStatus;
      destination = 'climate';
    } else if (selectedProgramId) {
      payload.id = selectedProgramId;
      destination = 'climateprogram';
    }
    return this.http.patch(baseURL + destination, JSON.stringify(payload))
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  // TODO implement CRUD operations for climate programs

}
