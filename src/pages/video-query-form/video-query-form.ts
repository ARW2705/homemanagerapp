import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'page-video-query-form',
  templateUrl: 'video-query-form.html',
})
export class VideoQueryFormPage {

  queryForm: FormGroup;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private formBuilder: FormBuilder) {
      this.queryForm = this.formBuilder.group({
        startDateTime: '',
        endDateTime: '',
        event: 'all',
        starred: false,
        limit: 12
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VideoQueryFormPage');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  onSubmit() {
    this.viewCtrl.dismiss(this.queryForm.value);
  }

}
