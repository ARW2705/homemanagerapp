import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-video-options-popover',
  templateUrl: 'video-options-popover.html',
})
export class VideoOptionsPopoverPage {

  private videoNameList;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController) {
      this.videoNameList = this.navParams.get('list');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VideoOptionsPopoverPage');
  }

  submit(datetime, index) {
    this.viewCtrl.dismiss({filename: datetime, index: index});
  }

}
