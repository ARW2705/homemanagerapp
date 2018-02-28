import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import 'rxjs/add/operator/catch';

import { ClimateProgram } from '../../shared/climateprogram';
import { baseURL } from '../../shared/baseurl';
import { httpsPort } from '../../shared/https-port';
import { wssPort } from '../../shared/wss-port';

import { AuthenticationProvider } from '../authentication/authentication';
import { ProcessHttpmsgProvider } from '../process-httpmsg/process-httpmsg';

@Injectable()
export class ClimateProvider {

  desiredTemperature: number;
  maxPrograms: number = 10;
  payload = {type: '', data: ''};
  private socket;

  constructor(private http: HttpClient,
    private authService: AuthenticationProvider,
    private processHttpmsgservice: ProcessHttpmsgProvider) {
      console.log('Hello ClimateProvider Provider');
  }

  /* Websocket handlers */

  // listen on websocket for events
  listenForClimateData() {
    return new Observable(obs => {
      const token = this.authService.getToken();
      this.socket = io(baseURL + wssPort, {query: {token: token}});
      this.socket.on('new-climate-data', data => {
        this.payload.type = 'climate-data';
        this.payload.data = data.data;
        console.log('New climate data from server', this.payload);
        obs.next(this.payload);
      });
      this.socket.on('new-climate-program', data => {
        this.payload.type = 'new-program';
        this.payload.data = data.data
        console.log('New climate program from server', this.payload);
        obs.next(this.payload);
      });
      this.socket.on('selected-program', data => {
        this.payload.type = 'select-program';
        this.payload.data = data.data;
        console.log('Selected program id:', this.payload.data);
        obs.next(this.payload);
      });
      this.socket.on('updated-climate-program', data => {
        this.payload.type = 'program-update';
        this.payload.data = data.data
        console.log('New climate program from server', this.payload);
        obs.next(this.payload);
      });
      this.socket.on('deleted-climate-program', data => {
        this.payload.type = 'delete-program';
        this.payload.data = data.data;
        console.log('New climate program from server', this.payload);
        obs.next(this.payload);
      });
      this.socket.on('error', error => {
        this.payload.type = 'error';
        this.payload.data = error;
        console.log('Encountered an error', error);
        obs.next(this.payload);
      });
      this.socket.on('disconnect', notification => {
        console.log("Client disconnect", notification);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

  // update climate parameters from app - will override running programs
  updateClimateParameters(temperature: number = null, mode: string = null) {
    this.desiredTemperature = temperature;
    const payload:any = {};
    if (temperature) {
      payload.targetTemperature = temperature;
    } else if (mode) {
      payload.selectedMode = mode;
    }
    console.log('New operating parameters selected', payload);
    this.socket.emit('patch-current-climate-data', payload);
  }

  // deactivate all running programs - if program selected, set it to active
  selectProgram(id: string) {
    console.log('Select program to run with id:', id);
    this.socket.emit('select-program', id);
  }

  // add new program
  addNewProgram(program: ClimateProgram) {
    console.log('Submitting new program');
    this.socket.emit('post-current-climate-data', program);
  }

  // update existing program
  updateSelectedProgram(update: ClimateProgram) {
    console.log('Updating program:', update._id);
    this.socket.emit('update-specified-program', update);
  }

  // delete existing program
  deleteSelectedProgram(id: string) {
    console.log('Deleting program with id:', id);
    this.socket.emit('delete-specified-program', id);
  }

  /* REST API handlers */

  // get intial climate data - temps/humidity/etc
  // on init only, websocket handles subsequent updates
  getInitialClimateData(): Observable<any> {
    return this.http.get(baseURL + httpsPort + 'climate')
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  // get all climate pre-programmed documents
  getClimatePrograms(): Observable<any> {
    return this.http.get(baseURL + httpsPort + 'climate/programs')
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  /* Service provider utility */

  getDesiredTemperature(): number {
    return this.desiredTemperature;
  }

  // return max number of programs
  isMaxPrograms(currentNumberOfPrograms: number): boolean {
    return currentNumberOfPrograms < this.maxPrograms;
  }

  // send override target temperature and/or mode
  // updateClimateParameters(temperature: number = null,
  //   selectedMode: string = null): Observable<any> {
  //   this.desiredTemperature = temperature;
  //   const payload:any = {};
  //   if (temperature) {
  //     payload.targetTemperature = temperature;
  //   } else if (selectedMode) {
  //     payload.selectedMode = selectedMode;
  //   }
  //   console.log(payload);
  //   return this.http.patch(`${baseURL}climate`, payload)
  //     .catch(err => this.processHttpmsgservice.handleError(err));
  // }

  // update selected program
  // updateSelectedProgram(update: ClimateProgram): Observable<any> {
  //   return this.http.patch(baseURL + httpsPort + `climate/programs/${update.id}`, update)
  //     .catch(err => this.processHttpmsgservice.handleError(err));
  // }

  // select active pre-programmed
  // selectPreProgrammed(id: string): Observable<any> {
  //   return this.http.patch(`${baseURL}climate/programs/${id}`, {isActive: true})
  //     .catch(err => this.processHttpmsgservice.handleError(err));
  // }

  // add program to list of climate programs
  // addProgram(program: ClimateProgram): Observable<any> {
  //   return this.http.post(`${baseURL}climate/programs/`, program)
  //     .catch(err => this.processHttpmsgservice.handleError(err));
  // }

}
