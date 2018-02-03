import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { ClimateProgram } from '../../../shared/climateprogram';
import { ClimateProvider } from '../../../providers/climate/climate';
/**
 * Generated class for the SelectProgramPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
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

  selectProgram(index: number) {
    console.log(this.programs[index]);
    this.selectedProgram = this.programs[index];
    this.dismiss();
  }

  dismiss() {
    this.viewCtrl.dismiss(this.selectedProgram);
  }

}
