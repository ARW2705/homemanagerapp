import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';

import { ClimateProgram } from '../../../shared/climateprogram';

import { ClimateProvider } from '../../../providers/climate/climate';

import { SchedulerPage } from '../../scheduler/scheduler';

@IonicPage()
@Component({
  selector: 'page-update-program',
  templateUrl: 'update-program.html',
})
export class UpdateProgramPage implements OnInit {

  programs: ClimateProgram[];
  programUpdateForm: FormGroup;
  selectedProgram: ClimateProgram;
  name: AbstractControl;
  isValidSchedule: boolean = false;
  errMsg: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private climateservice: ClimateProvider) {
      this.programUpdateForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
        mode: ['', Validators.required],
        isActive: false
      });
      this.name = this.programUpdateForm.controls['name'];
  }

  ngOnInit() {
    this.climateservice.getClimatePrograms()
      .subscribe(programs => this.programs = programs,
        err => this.errMsg = err);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UpdateProgramPage');
  }

  updateProgram(index: number) {
    console.log(this.programs[index]);
    const selected = this.programs[index];
    this.programUpdateForm.value.name = selected.name;
    this.programUpdateForm.value.mode = selected.mode;
    this.programUpdateForm.value.isActive = selected.isActive;
    this.selectedProgram = selected;
  }

  /*
    open modal to select day/time breaks/zone/temperature settings
    all data points required to submit new program
    schedule initializes values to selected program's values
  */
  openUpdateScheduleModal() {
    const modal = this.modalCtrl.create(SchedulerPage, {program: this.selectedProgram});
    modal.onDidDismiss(data => {
      if (data) {
        if (data.indexOf(-1) == -1) {
          this.programUpdateForm.value.program = data;
        }
      }
    });
    modal.present();
  }

  onSubmit() {
    if (!this.programUpdateForm.value.program) {
      this.programUpdateForm.value.program = this.selectedProgram.program;
    }
    console.log('submiting...', this.programUpdateForm.value);
    this.viewCtrl.dismiss(this.programUpdateForm.value);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
