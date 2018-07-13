import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { GarageDoor } from '../../shared/garagedoor';
import { GarageDoorProvider } from '../../providers/garage-door/garage-door';
import { WebsocketConnectionProvider } from '../../providers/websocket-connection/websocket-connection';

@Component({
  selector: 'page-garagedoor',
  templateUrl: 'garagedoor.html',
})
export class GaragedoorPage implements OnInit {

  doorStatus: GarageDoor;
  errMsg: string;
  private socket;
  private _unsubscribe: Subject<void> = new Subject<void>();

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private garageDoorService: GarageDoorProvider,
    private wssConnection: WebsocketConnectionProvider) {
  }

  ngOnInit() {
    this.getGarageDoorStatus();
    try {
      this.wssConnection.getSocket()
        .takeUntil(this._unsubscribe)
        .subscribe(socket => {
          console.log('Garage door connection to socket established', socket);
          this.socket = socket;
          this.garageDoorService.listenForGarageDoorData(socket)
            .takeUntil(this._unsubscribe)
            .subscribe(data => {
              console.log('Incoming data from server', data);
              this.handleWebsocketData(data);
            });
        });
    } catch(e) {
      console.log('Socket connection error', e);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GaragedoorPage');
  }

  ionViewDidLeave() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  handleWebsocketData(data: any) {
    console.log('New garage status');
    this.doorStatus = data.data;
  }

  getGarageDoorStatus() {
    this.garageDoorService.getGarageDoorStatus()
      .subscribe(status => {
        this.doorStatus = status;
      },
      err => this.errMsg = err);
  }

  operateGarageDoor() {
    const action = (this.doorStatus.targetPosition == "OPEN")? "CLOSED": "OPEN";
    this.garageDoorService.operateGarageDoor(action);
  }

}
