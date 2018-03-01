import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { GarageDoor } from '../../shared/garagedoor';
import { GarageDoorProvider } from '../../providers/garage-door/garage-door';
import { WebsocketConnectionProvider } from '../../providers/websocket-connection/websocket-connection';

@IonicPage()
@Component({
  selector: 'page-garagedoor',
  templateUrl: 'garagedoor.html',
})
export class GaragedoorPage implements OnInit, OnDestroy {

  doorStatus: GarageDoor;
  updateTimer: any = null;
  errMsg: string;
  private socket;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private garageDoorService: GarageDoorProvider,
    private wssConnection: WebsocketConnectionProvider) {
  }

  ngOnInit() {
    this.getGarageDoorStatus();
    this.wssConnection.getSocket()
      .subscribe(socket => {
        console.log('Climate control connection to socket established', socket);
        this.socket = socket;
        this.garageDoorService.listenForGarageDoorData(socket)
          .subscribe(data => {
            console.log('Incoming data from server', data);
            this.handleWebsocketData(data);
          });
      });
  }

  ngOnDestroy() {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GaragedoorPage');
  }

  handleWebsocketData(data: any) {
    console.log('New garage status');
    this.doorStatus = data.data;
  }

  getGarageDoorStatus() {
    this.garageDoorService.getGarageDoorStatus()
      .subscribe(status => {
        if (!status.inMotion && status.position == status.targetPosition) {
          clearInterval(this.updateTimer);
          this.updateTimer = null;
        }
        this.doorStatus = status;
      },
      err => this.errMsg = err);
  }

  operateGarageDoor() {
    const action = (this.doorStatus.targetPosition == "OPEN")? "CLOSED": "OPEN";
    this.garageDoorService.operateGarageDoor(action);
  }

}
