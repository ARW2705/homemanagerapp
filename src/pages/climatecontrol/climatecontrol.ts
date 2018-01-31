import { Component, OnInit, Inject } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Climate } from '../../shared/climate';
import { ClimateProgram } from '../../shared/climateprogram';
import { ClimateProvider } from '../../providers/climate/climate';

@IonicPage()
@Component({
  selector: 'page-climatecontrol',
  templateUrl: 'climatecontrol.html',
})
export class ClimatecontrolPage implements OnInit {

  climate: Climate;
  programs: ClimateProgram[];
  errMsg: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private climateservice: ClimateProvider,
    @Inject('BaseURL') private BaseURL) {
  }

  ngOnInit() {
    this.climateservice.getCurrentClimateData()
      .subscribe(climate => this.climate = climate,
        err => this.errMsg = err);
    this.climateservice.getClimatePrograms()
      .subscribe(programs => this.programs = programs,
        err => this.errMsg = err);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClimatecontrolPage');
  }

}
