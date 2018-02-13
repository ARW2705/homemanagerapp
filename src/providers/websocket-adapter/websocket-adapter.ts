import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';

import { baseURL } from '../../shared/baseurl';
import { WebsocketProvider } from '../websocket/websocket';

export interface Message {
  data: any
}

@Injectable()
export class WebsocketAdapterProvider {

  public messages: Subject<Message>;

  constructor(wsService: WebsocketProvider) {
    console.log('Hello WebsocketAdapterProvider Provider');
    this.messages = <Subject<Message>>wsService
      .connect(baseURL)
      .map((response: MessageEvent): Message => {
        const data = JSON.parse(response.data);
        return {data: data};
      });
  }

}
