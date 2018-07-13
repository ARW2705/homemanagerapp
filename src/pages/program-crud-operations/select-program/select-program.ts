import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { ClimateProgram } from '../../../shared/climateprogram';

import { ClimateProvider } from '../../../providers/climate/climate';

@Component({
  selector: 'page-select-program',
  templateUrl: 'select-program.html',
})
export class SelectProgramPage implements OnInit {

  programs: ClimateProgram[];
  selectedProgram: ClimateProgram;
  errMsg: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private climateservice: ClimateProvider) {
  }

  ngOnInit() {
    this.climateservice.getClimatePrograms()
      .subscribe(programs => this.programs = programs,
        err => this.errMsg = err);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SelectProgramPage');
  }

  // select program from index number in list
  selectProgram(index: number) {
    this.selectedProgram = this.programs[index];
    this.dismiss();
  }

  // set all programs to inactive
  stopProgram() {
    this.selectedProgram = undefined;
    this.dismiss();
  }

  dismiss() {
    this.viewCtrl.dismiss(this.selectedProgram);
  }

}
