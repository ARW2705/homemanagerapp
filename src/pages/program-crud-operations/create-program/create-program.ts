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

  programForm: FormGroup;
  name: AbstractControl;
  isValidSchedule: boolean = false;
  scheduleArray: Array<number>;
  days: Array<string> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    private formBuilder: FormBuilder) {
      this.programForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
        mode: ['', Validators.required],
        isActive: false
      });
      this.name = this.programForm.controls['name'];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateProgramPage');
  }

  /*
    open modal to select day/time-breaks/zone/temperature settings
    all data points required to submit new program
    schedule initializes all values to -1 on load
  */
  openSchedulerModal() {
    const modal = this.modalCtrl.create(SchedulerPage, {newSchedule: this.scheduleArray});
    modal.onDidDismiss(data => {
      if (data) {
        if (data.indexOf(-1) == -1) {
          this.scheduleArray = data;
          console.log(this.scheduleArray);
          this.isValidSchedule = true;
        }
      }
    });
    modal.present();
  }

  onSubmit() {
    this.programForm.value.program = this.scheduleArray;
    console.log("Submitting...", this.programForm.value);
    this.viewCtrl.dismiss(this.programForm.value);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
