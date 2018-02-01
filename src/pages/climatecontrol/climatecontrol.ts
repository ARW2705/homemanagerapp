import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Slides } from 'ionic-angular';

import { Climate } from '../../shared/climate';
import { Sensor } from '../../shared/sensor';
import { ClimateProgram } from '../../shared/climateprogram';
import { ClimateProvider } from '../../providers/climate/climate';

@IonicPage()
@Component({
  selector: 'page-climatecontrol',
  templateUrl: 'climatecontrol.html',
})
export class ClimatecontrolPage implements OnInit {

  @ViewChild('climateSlide') slides: Slides;
  climate: Climate;
  zones: Array<Sensor>;
  programs: ClimateProgram[];
  selectedProgram: ClimateProgram;
  errMsg: string;
  selectedZone: number = 0;
  minTemperature: number = 60;
  maxTemperature: number = 80;
  unitType: string = "e";
  desiredTemperature: number;
  currentTemperature: number;
  outputTempToThermostat: number;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private climateservice: ClimateProvider,
    @Inject('baseURL') private baseURL) {
      this.desiredTemperature = this.climateservice.getDesiredTemperature();
  }

  ngOnInit() {
    this.climateservice.getCurrentClimateData()
      .subscribe(climate => {
          this.climate = climate;
          this.zones = this.climate.zoneData;
        },
        err => this.errMsg = err);
    this.climateservice.getClimatePrograms()
      .subscribe(programs => {
          this.programs = programs;
          this.selectedProgram = programs.filter(program => program.isActive)[0]
            || {name: "None Selected", isActive: false};
        },
        err => this.errMsg = err);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClimatecontrolPage');
  }

  onSlideChanged(event) {

  }

  onSliderChangeEnd() {
    this.climateservice.updateDesiredTemperature(this.desiredTemperature);
    this.outputTempToThermostat = this.desiredTemperature;
    console.log(this.outputTempToThermostat);
  }

  getTemperatureSymbol() {
    return (this.unitType === 'm') ? "&#8451": "&#8457";
  }

}
