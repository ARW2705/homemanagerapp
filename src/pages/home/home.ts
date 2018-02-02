import { Component, OnInit, Inject } from '@angular/core';
import { NavController, ActionSheetController, ModalController, ToastController } from 'ionic-angular';

import { Climate } from '../../shared/climate';
import { Sensor } from '../../shared/sensor';
import { ClimateProgram } from '../../shared/climateprogram';
import { ClimateProvider } from '../../providers/climate/climate';
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

  constructor(public navCtrl: NavController,
    private climateservice: ClimateProvider,
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
    console.log("Open Action Sheet");
    const actionSheet = this.actionsheetCtrl.create({
      title: 'Select an Option',
      buttons: [
        {
          text: 'Select Program',
          handler: () => {
            console.log("Select Program");
            // start selection modal
            const modal = this.modalCtrl.create(SelectProgramPage);
            modal.onDidDismiss(data => {
              if (data && data.valid) {
                console.log("Valid", data);
              } else if (data) {
                console.log("Invalid", data);
              }
            });
            modal.present();
          }
        },
        {
          text: 'Create a New Program',
          handler: () => {
            console.log("Create a New Program");
            // start creation modal
            const modal = this.modalCtrl.create(CreateProgramPage);
            modal.onDidDismiss(data => {
              if (data.valid) {
                console.log("Valid", data);
              } else {
                console.log("Invalid", data);
              }
            });
            modal.present();
          }
        },
        {
          text: 'Update Existing Program',
          handler: () => {
            console.log("Update Existing Program");
            // start update modal
            const modal = this.modalCtrl.create(UpdateProgramPage);
            modal.onDidDismiss(data => {
              if (data.valid) {
                console.log("Valid", data);
              } else {
                console.log("Invalid", data);
              }
            });
            modal.present();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log("Action sheet cancelled");
          }
        }
      ]
    });
    actionSheet.present();
  }

  getTemperatureSymbol() {
    return (this.unitType === 'm') ? "&#8451": "&#8457";
  }

  updateDesiredTemperature() {
    this.climateservice.updateClimateParameters(this.desiredTemperature);
  }

}
