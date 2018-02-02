import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { IonicPage, NavController, NavParams, ActionSheetController, ModalController, ToastController } from 'ionic-angular';
import { Slides } from 'ionic-angular';

import { Climate } from '../../shared/climate';
import { Sensor } from '../../shared/sensor';
import { ClimateProgram } from '../../shared/climateprogram';
import { ClimateProvider } from '../../providers/climate/climate';
import { minTemperature, maxTemperature } from '../../shared/temperatureconst';

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
    @Inject('baseURL') private baseURL,
    @Inject('minTemperature') private minTemperature,
    @Inject('maxTemperature') private maxTemperature) {
  }

  ngOnInit() {
    this.climateservice.getCurrentClimateData()
      .subscribe(climate => {
        this.desiredTemperature = climate.targetTemperature;
        this.zones = climate.zoneData;
        return this.climate = climate;
        },
        err => this.errMsg = err);
    this.climateservice.getClimatePrograms()
      .subscribe(programs => {
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

  updateOperatingStatusCard() {
    this.climateservice.getCurrentClimateData()
      .subscribe(climate => {
        this.climate.operatingStatus = climate.operatingStatus;
        this.climate.selectedMode = climate.selectedMode;
      }, err => this.errMsg = err);
    this.climateservice.getClimatePrograms()
      .subscribe(programs => this.selectedProgram = programs.filter(program => program.isActive)[0]
        || {name: "None Selected", isActive: false},
        err => this.errMsg = err);
  }

  onSliderChangeEnd() {
    console.log(this.desiredTemperature);
    this.displayLoading();
    this.updateDesiredTemperature();
  }

  openActionSheet() {
    console.log("Open Action Sheet");
    const actionSheet = this.actionsheetCtrl.create({
      title: 'Select an Option',
      buttons: [
        {
          text: 'Select Program',
          handler: () => {
            console.log("Select Program");
            // start selection modal
          }
        },
        {
          text: 'Create a New Program',
          handler: () => {
            console.log("Create a New Program");
            // start creation modal
          }
        },
        {
          text: 'Update Existing Program',
          handler: () => {
            console.log("Update Existing Program");
            // start update modal
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

          }
        },
        {
          text: 'HEAT',
          handler: () => {

          }
        },
        {
          text: 'FAN',
          handler: () => {

          }
        },
        {
          text: 'OFF',
          handler: () => {

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

  getTemperatureSymbol() {
    return (this.unitType === 'm') ? "&#8451": "&#8457";
  }

  updateDesiredTemperature() {
    this.climateservice.updateClimateParameters(this.desiredTemperature)
      .subscribe(update => {
        console.log("Update complete", update);
        this.updateOperatingStatusCard();
      }, err => this.errMsg = err);
  }

}
