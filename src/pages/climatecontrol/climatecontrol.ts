import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ModalController, ToastController } from 'ionic-angular';
import { Slides } from 'ionic-angular';

import { Climate } from '../../shared/climate';
import { Sensor } from '../../shared/sensor';
import { ClimateProgram } from '../../shared/climateprogram';
import { ClimateProvider } from '../../providers/climate/climate';
import { CreateProgramPage } from '../program-crud-operations/create-program/create-program';
import { SelectProgramPage } from '../program-crud-operations/select-program/select-program';
import { UpdateProgramPage } from '../program-crud-operations/update-program/update-program';
import { LoginPage } from '../login/login';

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
  unitType: string = "e";
  desiredTemperature: number;
  currentTemperature: number;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private climateservice: ClimateProvider,
    private toastCtrl: ToastController,
    private actionsheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    @Inject('minTemperature') private minTemperature,
    @Inject('maxTemperature') private maxTemperature) {
  }

  ngOnInit() {
    this.getClimateControlData();
  }

  getClimateControlData() {
    this.climateservice.getCurrentClimateData()
      .subscribe(climate => {
        console.log(climate);
        this.desiredTemperature = climate.targetTemperature;
        this.zones = climate.zoneData;
        return this.climate = climate;
        },
        err => this.errMsg = err);
    this.climateservice.getClimatePrograms()
      .subscribe(programs => {
          console.log(programs);
          this.programs = programs;
          return this.selectedProgram = programs.filter(program => program.isActive)[0]
            || {name: "None Selected", isActive: false};
        },
        err => this.errMsg = err);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClimatecontrolPage');
  }

  displayLoading() {
    this.climate.operatingStatus = "UPDATING";
    this.climate.selectedMode = "UPDATING";
    this.selectedProgram.isActive = false;
  }

  onSliderChangeEnd() {
    console.log(this.desiredTemperature);
    this.displayLoading();
    this.updateDesiredTemperature();
  }

  slideToLeft(index: number) {
    this.slides.slideTo(index-1);
  }

  slideToRight(index: number) {
    this.slides.slideTo(index+1);
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
              const id = (data) ? data._id: 0;
              this.climateservice.selectPreProgrammed(id)
                .subscribe(update => {
                  console.log("Updated", update);
                  this.getClimateControlData();
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

  openModeActionSheet() {
    const actionSheet = this.actionsheetCtrl.create({
      title: 'Select Mode',
      buttons: [
        {
          text: 'COOL',
          handler: () => {
            this.updateDesiredMode('COOL');
          }
        },
        {
          text: 'HEAT',
          handler: () => {
            this.updateDesiredMode('HEAT');
          }
        },
        {
          text: 'FAN',
          handler: () => {
            this.updateDesiredMode('FAN');
          }
        },
        {
          text: 'OFF',
          handler: () => {
            this.updateDesiredMode('OFF');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log("Mode selection cancelled");
          }
        }
      ]
    });
    actionSheet.present();
  }

  openLogin() {
    const modal = this.modalCtrl.create(LoginPage);
    modal.onDidDismiss(data => {
      if (data !== undefined) {
        this.navCtrl.setRoot(ClimatecontrolPage);
      }
    });
    modal.present();
  }

  getTemperatureSymbol() {
    return (this.unitType === 'm') ? "&#8451": "&#8457";
  }

  updateDesiredTemperature() {
    this.climateservice.updateClimateParameters(this.desiredTemperature)
      .subscribe(update => {
        console.log("Updated", update);
        this.getClimateControlData();
      }, err => this.errMsg = err);
  }

  updateDesiredMode(mode: string) {
    this.climateservice.updateClimateParameters(null, mode)
      .subscribe(update => {
        console.log("Updated", update);
        this.getClimateControlData();
      }, err => this.errMsg = err);
  }

}
