import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import 'rxjs/add/operator/catch';

import { ClimateProgram } from '../../shared/climateprogram';
import { baseURL } from '../../shared/baseurl';
import { apiVersion } from '../../shared/apiVersion';

import { ProcessHttpmsgProvider } from '../process-httpmsg/process-httpmsg';

@Injectable()
export class ClimateProvider {

  desiredTemperature: number;
  payload = {type: null, data: null};
  thermostatConnected: boolean = false;
  thermostatVerified: boolean = false;
  thermostatConnectedAt: Date;
  thermostatDisconnectedAt: Date;
  private socket;

  constructor(private http: HttpClient,
    private processHttpmsgservice: ProcessHttpmsgProvider) {
      console.log('Hello ClimateProvider Provider');
  }

  /* Websocket handlers */

  // listen on websocket for events
  listenForClimateData(socket) {
    this.socket = socket;
    if (!this.socket) {
      console.log('Websocket failed to connect to server');
      return;
    }
    console.log('Listening for climate data');
    return new Observable(obs => {
      this.socket.on('echo-thermostat-verified', data => {
        console.log('thermostat has been verified');
        this.thermostatVerified = true;
        this.payload.type = 'thermostat-verified';
        this.payload.data = data.verifiedAt;
        obs.next(this.payload);
      });
      this.socket.on('echo-thermostat-connection', data => {
        this.thermostatConnected = true;
        this.thermostatConnectedAt = data.connectedAt;
        this.payload.type = 'thermostat-connected';
        this.payload.data = data.connectedAt;
        console.log('thermostat connection confirmed at', data.connectedAt);
        obs.next(this.payload);
      });
      this.socket.on('echo-thermostat-disconnection', data => {
        this.thermostatConnected = false;
        this.thermostatDisconnectedAt = data.disconnectedAt;
        this.payload.type = 'thermostat-disconnected';
        this.payload.data = data.disconnectedAt;
        console.log('Thermostat disconnected from server', data.disconnectedAt);
        obs.next(this.payload);
      });
      this.socket.on('echo-post-current-climate-data', data => {
        this.payload.type = 'climate-data';
        this.payload.data = data.data;
        this.thermostatConnected = true;
        console.log('New climate data from server', this.payload);
        obs.next(this.payload);
      });
      this.socket.on('echo-patch-current-climate-data', data => {
        this.payload.type = 'climate-data';
        this.payload.data = data.data;
        this.thermostatConnected = true;
        console.log('Updated climate data from server', this.payload);
        obs.next(this.payload);
      });
      this.socket.on('echo-post-new-program', data => {
        this.payload.type = 'new-program';
        this.payload.data = data.data
        this.thermostatConnected = true;
        console.log('New climate program from server', this.payload);
        obs.next(this.payload);
      });
      this.socket.on('echo-select-program', data => {
        this.payload.type = 'select-program';
        this.payload.data = data.data;
        this.thermostatConnected = true;
        console.log('Selected program id:', this.payload.data);
        obs.next(this.payload);
      });
      this.socket.on('echo-update-climate-program', data => {
        this.payload.type = 'program-update';
        this.payload.data = data.data
        this.thermostatConnected = true;
        console.log('New climate program from server', this.payload);
        obs.next(this.payload);
      });
      this.socket.on('echo-delete-climate-program', data => {
        this.payload.type = 'delete-program';
        this.payload.data = data.data;
        this.thermostatConnected = true;
        console.log('New climate program from server', this.payload);
        obs.next(this.payload);
      });
      this.socket.on('error', error => {
        this.payload.type = 'error';
        this.payload.data = error;
        console.log('Encountered an error', error);
        obs.next(this.payload);
      });
      this.socket.on('disconnect', _ => {
        console.log('Client disconnected from socket');
      });
      return () => {
        console.log('Climate control socket handler disconnected');
        // this.socket.disconnect();
      };
    });
  }

  pingThermostat() {
    this.socket.emit('ping-thermostat', {});
  }

  getThermostatConnectionDateTime() {
    return (this.thermostatConnected) ? this.thermostatConnectedAt: this.thermostatDisconnectedAt;
  }

  isThermostatConnected() {
    return (this.thermostatConnected && this.thermostatVerified);
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
    this.socket.emit('post-new-program', program);
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
    return this.http.get(baseURL + apiVersion + 'climate')
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  // get all climate pre-programmed documents
  getClimatePrograms(): Observable<any> {
    return this.http.get(baseURL + apiVersion + 'climate/programs')
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  /* Service provider utility */

  getDesiredTemperature(): number {
    return this.desiredTemperature;
  }

}
