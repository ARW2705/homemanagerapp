import { Component, OnInit, Inject } from '@angular/core';
import { NavController, ActionSheetController, ModalController, ToastController } from 'ionic-angular';

import { Climate } from '../../shared/climate';
import { Sensor } from '../../shared/sensor';
import { ClimateProgram } from '../../shared/climateprogram';
import { ClimateProvider } from '../../providers/climate/climate';
import { ClimateCrudProvider } from '../../providers/climate-crud/climate-crud';
import { minTemperature, maxTemperature } from '../../shared/temperatureconst';
import { CreateProgramPage } from '../program-crud-operations/create-program/create-program';
import { SelectProgramPage } from '../program-crud-operations/select-program/select-program';
import { UpdateProgramPage } from '../program-crud-operations/update-program/update-program';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  climate: Climate;
  climateErrMsg: string;
  activeProgram: string;
  unitType: string = 'e';
  desiredTemperature: number;
  program: string;
  errMsg: string;

  constructor(public navCtrl: NavController,
    private climateservice: ClimateProvider,
    private climateCRUDservice: ClimateCrudProvider,
    private actionsheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,
    @Inject('baseURL') private baseURL,
    @Inject('minTemperature') private minTemperature,
    @Inject('maxTemperature') private maxTemperature) {
    }

  ngOnInit() {
    this.climateservice.getCurrentClimateData()
      .subscribe(climate => {
        this.desiredTemperature = climate.targetTemperature;
        return this.climate = climate;
        },
        err => this.climateErrMsg = err);
    this.climateservice.getClimatePrograms()
      .subscribe(programs => this.program = programs.filter(
        program => program.isActive)[0].name || "None Selected",
        err => this.climateErrMsg = err);
  }

  onSliderChangeEnd() {
    console.log(this.desiredTemperature);
    this.updateDesiredTemperature();
  }

  openClimateProgramActionSheet() {
    this.climateCRUDservice.openClimateProgramActionSheet();
  }

  getTemperatureSymbol() {
    return (this.unitType === 'm') ? "&#8451": "&#8457";
  }

  updateDesiredTemperature() {
    this.climateservice.updateClimateParameters(this.desiredTemperature)
    .subscribe(update => {
      console.log("Updated", update);
    }, err => this.errMsg = err);
  }

}
