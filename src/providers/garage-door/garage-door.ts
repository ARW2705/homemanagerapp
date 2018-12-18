import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import { baseURL } from '../../shared/baseurl';
import { apiVersion } from '../../shared/apiVersion';
import { GarageDoor } from '../../shared/garagedoor';

import { ProcessHttpmsgProvider } from '../process-httpmsg/process-httpmsg';

@Injectable()
export class GarageDoorProvider {

  payload = {type: null, data: null};
  private socket;

  constructor(public http: HttpClient,
    private processHttpmsgservice: ProcessHttpmsgProvider) {
    console.log('Hello GarageDoorProvider Provider');
  }

  listenForGarageDoorData(socket) {
    this.socket = socket;
    console.log('Listening for garage door data');
    return new Observable(obs => {
      this.socket.on('garage-door-status-changed', data => {
        this.payload.type = 'garage-door';
        this.payload.data = data.data;
        console.log('New garage door status from server', this.payload);
        obs.next(this.payload);
      });
      this.socket.on('disconnect', notification => {
        console.log('Client disconnected from socket');
      });
      return () => {
        console.log('Garage door socket handler disconnected');
      };
    });
  }

  operateGarageDoor(action: string) {
    console.log('Request garage door:', action);
    this.socket.emit('operate-garage-door', {targetPosition: action});
  }

  getGarageDoorStatus(): Observable<any> {
    return this.http.get(baseURL + apiVersion + 'garagedoor')
      .catch(err => this.processHttpmsgservice.handleError(err));
  }

  // operateGarageDoor(action: string) {
  //   return this.http.patch(baseURL + httpsPort + 'garagedoor', {targetPosition: action})
  //     .catch(err => this.processHttpmsgservice.handleError(err));
  // }

}
