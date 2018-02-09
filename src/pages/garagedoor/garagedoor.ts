import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';



@IonicPage()
@Component({
  selector: 'page-garagedoor',
  templateUrl: 'garagedoor.html',
})
export class GaragedoorPage {

  errMsg: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GaragedoorPage');
  }

}
