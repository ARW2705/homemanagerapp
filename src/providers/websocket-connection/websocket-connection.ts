import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

import { AuthenticationProvider } from '../authentication/authentication';

import { baseURL } from '../../shared/baseurl';

@Injectable()
export class WebsocketConnectionProvider {

  private socket;

  constructor(private authService: AuthenticationProvider) {
    console.log('Hello WebsocketConnectionProvider Provider');
  }

  connectSocket() {
    return new Observable(obs => {
      const token = this.authService.getToken();
      this.socket = io(baseURL, {query: {token: token}});
      console.log('Connected to Socket');
      obs.next(this.socket);
    });
  }

  disconnectSocket() {
    console.log('Disconnected from socket');
    this.socket.disconnect();
  }

  getSocket() {
    return new Observable(obs => {
      obs.next(this.socket);
    });
  }

}
