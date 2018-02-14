import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { GarageDoor } from '../../shared/garagedoor';
import { GarageDoorProvider } from '../../providers/garage-door/garage-door';

@IonicPage()
@Component({
  selector: 'page-garagedoor',
  templateUrl: 'garagedoor.html',
})
export class GaragedoorPage implements OnInit, OnDestroy {

  doorStatus: GarageDoor;
  updateTimer: any = null;
  errMsg: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private garageDoorService: GarageDoorProvider) {
  }

  ngOnInit() {
    this.getGarageDoorStatus();
  }

  ngOnDestroy() {
    if (this.updateTimer != null) clearInterval(this.updateTimer);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GaragedoorPage');
  }

  getGarageDoorStatus() {
    this.garageDoorService.getGarageDoorStatus()
      .subscribe(status => {
        if (!status.inMotion && status.position == status.targetPosition) {
          if (this.updateTimer != null) clearInterval(this.updateTimer);
        }
        this.doorStatus = status;
      },
      err => this.errMsg = err);
  }

  operateGarageDoor() {
    const action = (this.doorStatus.targetPosition == "OPEN")? "CLOSED": "OPEN";
    this.garageDoorService.operateGarageDoor(action)
      .subscribe(status => {
        console.log("Garage door activating...");
        this.updateTimer = setInterval(() => {
              console.log("Checking garage door status");
              this.getGarageDoorStatus();
            }, (1000));
      });
  }

}
