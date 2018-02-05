import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';

import { SchedulerPage } from '../../scheduler/scheduler';

@IonicPage()
@Component({
  selector: 'page-create-program',
  templateUrl: 'create-program.html',
})
export class CreateProgramPage {

  program: FormGroup;
  name: AbstractControl;
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
      this.name = this.program.controls['name'];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateProgramPage');
  }

  openSchedulerModal() {
    const modal = this.modalCtrl.create(SchedulerPage);
    modal.onDidDismiss(data => {
      if (data) {
        if (data.indexOf(-1) == -1) {
          this.program.value.program = data;
          this.isValidSchedule = true;
        }
      }
    });
    modal.present();
  }

  onSubmit() {
    this.program.value.name = this.program.value.name;
    this.program.value.mode = this.program.value.mode;
    this.program.value.isActive = this.program.value.isActive;
    console.log("Submitting...", this.program.value);
    this.viewCtrl.dismiss();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
