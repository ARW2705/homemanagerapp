import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { SchedulerPage } from '../../scheduler/scheduler';

@IonicPage()
@Component({
  selector: 'page-create-program',
  templateUrl: 'create-program.html',
})
export class CreateProgramPage {

  program: FormGroup;
  isValidSchedule: boolean = false;
  days: Array<string> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    private formBuilder: FormBuilder) {
      this.program = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
        mode: ['', Validators.required],
        isActive: false
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateProgramPage');
  }

  openSchedulerModal() {
    console.log("Open Scheduler");
    const modal = this.modalCtrl.create(SchedulerPage);
    modal.onDidDismiss(data => {
      if (data) {
        console.log(data);
      }
    });
    modal.present();
  }

  onSubmit() {
    console.log("submitted");
    this.viewCtrl.dismiss();
  }

  dismiss() {
    console.log(this.program);
    this.viewCtrl.dismiss();
  }

}
