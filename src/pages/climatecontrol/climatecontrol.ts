import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { IonicPage, NavController, NavParams, ActionSheetController, ModalController, ToastController } from 'ionic-angular';
import { Slides } from 'ionic-angular';

import { Climate } from '../../shared/climate';
import { Sensor } from '../../shared/sensor';
import { ClimateProgram } from '../../shared/climateprogram';
import { ClimateProvider } from '../../providers/climate/climate';
import { ClimateCrudProvider } from '../../providers/climate-crud/climate-crud';
import { CreateProgramPage } from '../program-crud-operations/create-program/create-program';
import { SelectProgramPage } from '../program-crud-operations/select-program/select-program';
import { UpdateProgramPage } from '../program-crud-operations/update-program/update-program';

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
    private climateCRUDservice: ClimateCrudProvider,
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

  openClimateActionSheet() {
    this.climateCRUDservice.openClimateProgramActionSheet();
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

  getTemperatureSymbol() {
    return (this.unitType === 'm') ? "&#8451": "&#8457";
  }

  updateDesiredTemperature() {
    this.climateservice.updateClimateParameters(this.desiredTemperature)
      .subscribe(update => {
        console.log("Updated", update);
        this.updateOperatingStatusCard();
      }, err => this.errMsg = err);
  }

  updateDesiredMode(mode: string) {
    this.climateservice.updateClimateParameters(null, mode)
      .subscribe(update => {
        console.log("Updated", update);
        this.updateOperatingStatusCard();
      }, err => this.errMsg = err);
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

}
