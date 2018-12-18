import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import 'rxjs/add/operator/catch';

import { baseURL } from '../../shared/baseurl';
import { apiVersion } from '../../shared/apiVersion';

import { ProcessHttpmsgProvider } from '../process-httpmsg/process-httpmsg';

/*
  Generated class for the SecCamProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SecCamProvider {

  payload = {type: null, data: null};
  private socket;

  constructor(public http: HttpClient,
    private processHttpMsgService: ProcessHttpmsgProvider) {
    console.log('Hello SecCamProvider Provider');
  }

  listenForSecCamData(socket) {
    this.socket = socket;
    if (!this.socket) {
      console.log('Websocket failed to connect to server');
      return;
    }
    console.log('Listening for seccam data');
    return new Observable(obs => {
      this.socket.on('response-get-video-list', data => {
        if (data.err) {
          this.payload.type = 'error';
          this.payload.data = data.err;
        } else {
          this.payload.type = 'video-list';
          this.payload.data = data.data;
        }
        obs.next(this.payload);
      });
      return () => {
        console.log('Security camera socket handler disconnected');
      };
    })
  }

  /**
   * TODO form for camera controls

   - set camera settings
   - activate/deactivate camera
   - activate/deactivate motion detection
   - shutdown camera
  **/

  getCameraFileNames(): Observable<any> {
    console.log('getting video file names');
    // this.socket.emit('request-get-video-list', {});
    return this.http.get(baseURL + apiVersion + 'security/seccam')
      .catch(err => this.processHttpMsgService.handleError(err));
  }

  toggleRecording(record) {
    this.socket.emit('request-stream', {stream: record});
  }

  getFileByName() {

  }

}
