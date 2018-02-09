import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import { ClimateProgram } from '../../shared/climateprogram';
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

  // get climate data - temps/humidity/etc
  getCurrentClimateData(): Observable<any> {
    return this.http.get(baseURL + 'climate')
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  // get all climate pre-programmed documents
  getClimatePrograms(): Observable<any> {
    return this.http.get(baseURL + 'climate/programs')
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  // send override target temperature and/or mode
  updateClimateParameters(temperature: number = null,
    operatingStatus: string = null): Observable<any> {
    this.desiredTemperature = temperature;
    const payload:any = {};
    if (temperature) {
      payload.targetTemperature = temperature;
    } else if (operatingStatus) {
      payload.operatingStatus = operatingStatus;
    }
    console.log("Submitting", payload);
    return this.http.patch(baseURL + 'climate', payload)
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  // update selected program
  updateSelectedProgram(update: ClimateProgram): Observable<any> {
    return this.http.patch(baseURL + `climate/programs/${update.id}`, update)
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  // select active pre-programmed
  selectPreProgrammed(id: string): Observable<any> {
    return this.http.patch(baseURL + `climate/programs/${id}`, {isActive: true})
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

}
