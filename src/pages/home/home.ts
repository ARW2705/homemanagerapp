import { Component, OnInit, Inject } from '@angular/core';
import { NavController, ActionSheetController, ModalController, ToastController } from 'ionic-angular';

import { Climate } from '../../shared/climate';
import { ClimateProgram } from '../../shared/climateprogram';
import { minTemperature, maxTemperature } from '../../shared/temperatureconst';
import { Sensor } from '../../shared/sensor';

import { ClimateProvider } from '../../providers/climate/climate';

import { CreateProgramPage } from '../program-crud-operations/create-program/create-program';
import { LoginPage } from '../login/login';
import { SelectProgramPage } from '../program-crud-operations/select-program/select-program';
import { UpdateProgramPage } from '../program-crud-operations/update-program/update-program';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  climate: Climate;
  climateErrMsg: string;
  unitType: string = 'e';
  desiredTemperature: number;
  program: string;
  errMsg: string;

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
    this.getHomeData();
    this.refreshHomeData();
  }

  // update data for each snapshot card every minute
  refreshHomeData() {
    setInterval(() => {
      console.log("Updating home data");
      this.getHomeData();
    }, (60 * 1000));
  }

  // get data for each page summary
  getHomeData() {
    this.climateservice.getCurrentClimateData()
      .subscribe(climate => {
        this.desiredTemperature = climate.targetTemperature;
        return this.climate = climate;
        },
        err => this.climateErrMsg = err);
    this.climateservice.getClimatePrograms()
      .subscribe(programs => {
        const active = programs.filter(program => program.isActive);
        if (active.length) {
          this.program = active[0].name;
        } else {
          this.program = "NONE SELECTED";
        }
      },
        err => this.climateErrMsg = err);
  }

  /*
    target temperature selection slider - will stop any active programs
    and set new target temperature - other parameters will be unchanged
    unless thermostat status changes
  */
  onSliderChangeEnd() {
    console.log("Selected temperature: ", this.desiredTemperature);
    this.updateTargetTemperature();
  }

  // climate control action sheet: select program, create program, update program
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
              const id = (data) ? data._id: 0;
              this.climateservice.selectPreProgrammed(id)
                .subscribe(update => {
                  console.log("Updated", update);
                  this.getHomeData();
                }, err => this.errMsg = err);
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
              if (data) {
                console.log("Valid", data);
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
              if (data) {
                console.log(data);
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

  // login modal if not authenticated, will refresh climate control page on login
  openLoginModal() {
    const modal = this.modalCtrl.create(LoginPage);
    modal.onDidDismiss(data => {
      if (data !== undefined) {
        this.navCtrl.setRoot(HomePage);
      }
    });
    modal.present();
  }

  // set html unicode for degrees fahrenheit or celsius
  getTemperatureSymbol() {
    return (this.unitType === 'm') ? "&#8451": "&#8457";
  }

  // override set temperature, any active program will be set to inactive
  updateTargetTemperature() {
    this.climateservice.updateClimateParameters(this.desiredTemperature)
    .subscribe(update => {
      console.log("Updated", update);
    }, err => this.errMsg = err);
  }

}
