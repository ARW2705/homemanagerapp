import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import 'rxjs/add/operator/catch';

import { Climate, ControlParams } from '../../shared/climate';
import { ClimateProgram } from '../../shared/climateprogram';
import { baseURL } from '../../shared/baseurl';
import { apiVersion } from '../../shared/apiVersion';

import { ProcessHttpmsgProvider } from '../process-httpmsg/process-httpmsg';

@Injectable()
export class ClimateProvider {

  desiredTemperature: number;
  thermostatConnectedAt: Date;
  thermostatDisconnectedAt: Date = null;
  updateTimeLimit = 5 * 60 * 1000;
  private connectionMonitorInterval;
  private retryCounter;
  private retryLimit;
  private thermostatDisconnectMsg;
  private socket;
  private climate: Climate;
  private programs: Array<ClimateProgram>;
  private storedProgramId: string;

  constructor(private http: HttpClient,
    private processHttpMsgService: ProcessHttpmsgProvider) {
      console.log('Hello ClimateProvider Provider');
  }

  setReconnectMonitorInterval() {
    console.log('Checking for thermostat connection');
    this.connectionMonitorInterval = setInterval(() => {
      if (!this.isThermostatConnected()) {
        console.log('Thermostat not verified, retrying...');
        this.pingThermostat();
        if (this.retryCounter > this.retryLimit) {
          this.thermostatDisconnectMsg = `Thermostat is not connected. Last connected at: ${this.getLastThermostatConnection()}`;
        }
        this.retryCounter++;
      } else {
        this.thermostatDisconnectMsg = '';
        this.retryCounter = 0;
      }
    }, 5000);
  }

  clearReconnectMonitorInterval() {
    clearInterval(this.connectionMonitorInterval);
  }

  /* Websocket handlers */

  // listen on websocket for events
  listenForClimateData(socket) {
    this.socket = socket;
    if (!this.socket) {
      console.log('Websocket failed to connect to server');
      return;
    }
    this.getInitialData();
    console.log('Listening for climate data');
    return new Observable(obs => {
      this.socket.on('broadcast-proxy-response-ping-thermostat', () => {
        this.updateThermostatConnection();
        obs.next(this.formatData('connection', {connectedAt: this.thermostatConnectedAt}));
      });

      this.socket.on('broadcast-request-update-thermostat-disconnection', timestamp => {
        this.thermostatDisconnectedAt = timestamp.lastConnectedAt;
        obs.next(this.formatData('connection', {disconnectedAt: this.thermostatDisconnectedAt}));
      });

      this.socket.on('broadcast-proxy-response-post-climate-data', data => {
        this.updateThermostatConnection();
        const formatted = this.formatData('climate', data);
        if (formatted.type != 'error') this.climate = data;
        obs.next(formatted);
      });

      this.socket.on('response-get-programs', programs => {
        const formatted = this.formatData('programs', programs);
        if (formatted.type != 'error') this.programs = programs;
        obs.next(formatted);
      });

      this.socket.on('broadcast-proxy-response-get-thermostat-program-id', id => {
        const formatted = this.formatData('program-id', id);
        this.storedProgramId = id.queryId;
        obs.next(formatted);
      });

      this.socket.on('broadcast-response-update-program', update => {
        const formatted = this.formatData('program-update', update);
        if (formatted.type != 'error') {
          const index = this.programs.map(program => program._id).indexOf(update.id);
          this.programs.splice(index, 1, update);
        }
        obs.next(formatted);
      });

      this.socket.on('broadcast-response-create-program', program => {
        const formatted = this.formatData('program-new', program);
        if (formatted.type != 'error') this.programs.push(program);
        obs.next(formatted);
      });

      this.socket.on('broadcast-proxy-response-update-program', update => {
        const formatted = this.formatData('program-update', update);
        if (formatted.type != 'error') {
          const index = this.programs.map(program => program._id).indexOf(update.id);
          if (index != -1) this.programs.splice(index, 1, update);
        }
        obs.next(formatted);
      });

      this.socket.on('broadcast-proxy-response-toggle-program', status => {
        const formatted = this.formatData('program-status', status);
        if (formatted.type != 'error') {
          const toUpdate = this.programs.find(program => program._id == status.id);
          if (toUpdate) toUpdate.isActive = status.isActive;
        }
        obs.next(formatted);
      });

      this.socket.on('broadcast-proxy-response-delete-program', dbres => {
        const formatted = this.formatData('program-delete', dbres);
        if (formatted.type != 'error') {
          const index = this.programs.map(program => program._id).indexOf(dbres.id);
          if (index != -1) this.programs.splice(index, 1);
        }
        obs.next(formatted);
      });

      this.socket.on('disconnect', _ => {
        console.log('Client disconnected from socket');
      });

      return () => {
        console.log('Climate control socket handler disconnected');
      };
    });
  }

  getClimate() {
    return this.climate;
  }

  getPrograms() {
    return this.programs;
  }

  getInitialData() {
    this.getClimateData();
    this.getClimatePrograms();
  }

  formatData(type: string, data: any) {
    return {
      type: data.error ? 'error': type,
      data: data.error ? data.error: data
    };
  }

  pingThermostat() {
    this.socket.emit('request-ping-thermostat', {});
  }

  getClimateData() {
    this.socket.emit('request-get-climate-data', {});
  }

  getClimatePrograms() {
    this.socket.emit('request-get-programs', {});
  }

  updateThermostatConnection() {
    this.thermostatConnectedAt = new Date();
    this.thermostatDisconnectedAt = null;
  }

  isThermostatConnected() {
    const now = new Date().getTime();
    const last = new Date(this.thermostatConnectedAt).getTime();
    return !(this.thermostatDisconnectedAt || now - last > this.updateTimeLimit);
  }

  getLastThermostatConnection():string {
    return `${this.thermostatConnectedAt}` || 'N/A';
  }

  getThermostatStoredProgramId() {
    this.socket.emit('request-get-thermostat-program-id');
  }

  setZoneName(deviceId: number, name: string) {
    this.socket.emit('request-update-zone-name', {deviceId: deviceId, name: name});
  }

  // update climate parameters from app - will override running programs
  updateClimateParameters(params: ControlParams) {
    this.desiredTemperature = params.setTemperature;
    console.log('New operating parameters selected', params);
    this.socket.emit('request-update-climate-settings', params);
  }

  // deactivate all running programs - if program selected, set it to active
  selectProgram(id: string) {
    console.log('Select program to run with id:', id);
    this.socket.emit('request-select-program', id);
  }

  // add new program
  addNewProgram(program: ClimateProgram) {
    console.log('Submitting new program');
    this.socket.emit('request-create-program', program);
  }

  // update existing program
  updateSelectedProgram(update: ClimateProgram) {
    console.log('Updating program:', update._id);
    this.socket.emit('request-update-program', update);
  }

  // delete existing program
  deleteSelectedProgram(id: string) {
    console.log('Deleting program with id:', id);
    this.socket.emit('request-delete-program', id);
  }

  /* Service provider utility */

  getDesiredTemperature(): number {
    return this.desiredTemperature;
  }

}
