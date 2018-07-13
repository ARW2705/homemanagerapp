import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import 'rxjs/add/operator/catch';

@Injectable()
export class LocalNodeProvider {

  payload = {type: null, data: null};
  localNodeConnectedAt: Date;
  localNodeDisconnectedAt: Date;
  localNodeConnected: boolean = false;
  private socket;

  constructor(public http: HttpClient) {
    console.log('Hello LocalNodeProvider Provider');
  }

  listenForLocalNode(socket) {
    this.socket = socket;
    if (!this.socket) {
      console.log('Websocket failed to connect to server');
      return;
    }
    return new Observable(obs => {
      this.socket.on('echo-local-node-connection', data => {
        this.payload.type = 'local-node-connected';
        this.payload.data = data.nodeConnectedAt;
        this.localNodeConnected = true;
        this.localNodeConnectedAt = data.nodeConnectedAt;
        console.log('Local node connected to server', data.nodeConnectedAt);
        obs.next(this.payload);
      });
      this.socket.on('echo-local-node-disconnection', data => {
        this.payload.type = 'local-node-disconnected';
        this.payload.data = data.nodeDisonnectedAt;
        this.localNodeConnected = false;
        this.localNodeDisconnectedAt = data.nodeDisconnectedAt;
        console.log('Local node disconnected from server', data.nodeDisonnectedAt);
        obs.next(this.payload);
      });
      return () => {
        console.log('Socket disconnected');
        this.socket.disconnect();
      };
    });
  }

  getLocalNodeConnectionDateTime() {
    return (this.localNodeConnected) ? this.localNodeConnectedAt: this.localNodeDisconnectedAt;
  }

  isLocalNodeConnected() {
    return this.localNodeConnected;
  }

}
