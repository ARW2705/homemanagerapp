import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import 'rxjs/add/operator/catch';

import { baseURL } from '../../shared/baseurl';
import { apiVersion } from '../../shared/apiVersion';

import { VideoMetaData } from '../../shared/videodata';

import { ProcessHttpmsgProvider } from '../process-httpmsg/process-httpmsg';


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
    this.getVideoFilenames({startDateTime: '', endDateTime: '', limit: 12});
    console.log('Listening for seccam data');
    return new Observable(obs => {
      this.socket.on('response-get-video-list', data => {
        console.log('get video response');
        if (data.error) {
          this.payload.type = 'error';
          this.payload.data = data.error;
        } else {
          this.payload.type = 'video-list';
          this.payload.data = data.data;
        }
        obs.next(this.payload);
      });
      this.socket.on('proxy-request-notify-new-video-available', data => {
        console.log('new video available');
        if (data.error) {
          this.payload.type = 'error';
          this.payload.data = data.error;
        } else {
          this.payload.type = 'new-video';
          this.payload.data = data.data;
        }
        obs.next(this.payload);
      });
      this.socket.on('response-update-video-data', data => {
        if (data.error) {
          this.payload.type = 'error';
          this.payload.data = data.error;
        } else {
          this.payload.type = 'updated-metadata';
          this.payload.data = data.data;
        }
        obs.next(this.payload);
      });
      this.socket.on('response-delete-video', data => {
        if (data.error) {
          this.payload.type = 'error';
          this.payload.data = data.error;
        } else {
          this.payload.type = 'video-deleted';
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

  toggleRecording(record) {
    this.socket.emit('request-stream', {stream: record});
  }

  getVideoFilenames(query) {
    const formattedQuery = {};
    formattedQuery['startDateTime'] = {
      $gte: (query.startDateTime == '') ? new Date('01 January 2010 00:00 UTC').toISOString(): query.startDateTime,
      $lte: (query.endDateTime == '') ? new Date().toISOString(): query.endDateTime
    };
    if (query.event != 'all') {
      formattedQuery['tiggerEvent'] = query.event;
    }
    if (query.starred) {
      formattedQuery['starred'] = true;
    }
    this.socket.emit('request-get-videos-by-params', {query: formattedQuery, limit: query.limit});
  }

  toggleStarred(id: string, starred: boolean) {
    this.socket.emit('request-update-video-data', {id: id, starred: starred});
  }

}
