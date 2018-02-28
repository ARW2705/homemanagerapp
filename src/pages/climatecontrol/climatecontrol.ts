import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ModalController, ToastController } from 'ionic-angular';
import { Slides } from 'ionic-angular';

import { Climate } from '../../shared/climate';
import { ClimateProgram } from '../../shared/climateprogram';
import { Sensor } from '../../shared/sensor';

import { ClimateProvider } from '../../providers/climate/climate';

import { CreateProgramPage } from '../program-crud-operations/create-program/create-program';
import { LoginPage } from '../login/login';
import { SelectProgramPage } from '../program-crud-operations/select-program/select-program';
import { UpdateProgramPage } from '../program-crud-operations/update-program/update-program';

@IonicPage()
@Component({
  selector: 'page-climatecontrol',
  templateUrl: 'climatecontrol.html',
})
export class ClimatecontrolPage implements OnInit, OnDestroy {

  @ViewChild('climateSlide') slides: Slides;
  climate: Climate;
  zones: Array<Sensor>;
  programs: ClimateProgram[];
  selectedProgram: ClimateProgram | any;
  errMsg: string;
  // updateTimer: any = null;
  selectedZone: number = 0;
  unitType: string = "e";
  targetTemperature: number;
  currentTemperature: number;
  private socket;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private climateservice: ClimateProvider,
    private toastCtrl: ToastController,
    private actionsheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    @Inject('minTemperature') private minTemperature,
    @Inject('maxTemperature') private maxTemperature) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClimatecontrolPage');
  }

  ngOnInit() {
    this.getInitialClimateData();
    this.socket = this.climateservice.listenForClimateData()
      .subscribe(data => {
        console.log('Incoming data from server', data);
        this.handleWebsocketData(data);
      });

    // this.getClimateControlData();
    // this.updateTimer = setInterval(() => {
    //       console.log("Updating home data");
    //       this.getClimateControlData();
    //     }, (60 * 1000));
  }

  ngOnDestroy() {
    this.socket.unsubscribe();
    // clearInterval(this.updateTimer);
  }

  // get climate and climate program data
  getInitialClimateData() {
    this.climateservice.getInitialClimateData()
      .subscribe(climate => {
        console.log(climate);
        this.targetTemperature = climate.targetTemperature;
        this.zones = climate.zoneData;
        return this.climate = climate;
        }, err => this.errMsg = err);
    this.climateservice.getClimatePrograms()
      .subscribe(programs => {
        console.log(programs);
        this.programs = programs;
        return this.selectedProgram = programs.filter(program => program.isActive)[0]
          || {name: "None Selected", isActive: false};
        }, err => this.errMsg = err);
  }

  handleWebsocketData(data: any) {
    const method = data.type;
    const result = data.data;
    switch (method) {
      case 'climate-data':
        this.targetTemperature = result.targetTemperature;
        this.zones = result.zoneData;
        this.climate = result;
        console.log('New climate data posted');
        break;
      case 'new-program':
        this.programs.push(result);
        this.selectedProgram = this.programs.filter(program => program.isActive)[0]
          || {name: 'None Selected', isActive: false};
        console.log('New climate program created');
        break;
      case 'select-program':
        this.selectedProgram = result || {name: "None Selected", isActive: false};
        console.log('Selected program id:');
        break;
      case 'program-update':
        for (let i=0; i<this.programs.length; i++) {
          if (this.programs[i]._id === result._id) {
            this.programs.splice(i, 1, result);
            console.log('Program has been updated');
            break;
          }
        }
        console.log('Program was not found');
        break;
      case 'delete-program':
        // TODO implement program deletion handler
        console.log('Program has been deleted');
        break;
      case 'error':
        // this.errMsg = result;
        console.log('Encountered an error');
        break;
      default:
        console.log('Supplied method is not valid');
        break;
    }
  }

  // override set temperature, any active program will be set to inactive
  updateTargetTemperature() {
    this.climateservice.updateClimateParameters(this.targetTemperature);
    // this.climateservice.updateClimateParameters(this.targetTemperature)
    //   .subscribe(update => {
    //     console.log("Updated", update);
    //     this.getClimateControlData();
    //   }, err => this.errMsg = err);
  }

  // override set mode, any active program will be set to inactive
  updateTargetMode(mode: string) {
    this.climateservice.updateClimateParameters(null, mode);
    // this.climateservice.updateClimateParameters(null, mode)
    //   .subscribe(update => {
    //     console.log("Updated", update);
    //     this.getClimateControlData();
    //   }, err => this.errMsg = err);
  }

  // set html unicode for degrees fahrenheit or celsius
  getTemperatureSymbol() {
    return (this.unitType === 'm') ? "&#8451": "&#8457";
  }

  /* target temperature selection slider - will stop any active programs
    and set new target temperature - other parameters will be unchanged
    unless thermostat status changes */
  onSliderChangeEnd() {
    console.log(this.targetTemperature);
    this.displayLoading();
    this.updateTargetTemperature();
  }

  // change to previous climate zone location card
  slideToLeft(index: number) {
    this.slides.slideTo(index-1);
  }

  // change to next climate zone location card
  slideToRight(index: number) {
    this.slides.slideTo(index+1);
  }

  // show updating messages while GET request is in progress
  displayLoading() {
    this.climate.operatingStatus = "UPDATING";
    this.climate.selectedMode = "UPDATING";
    this.selectedProgram.isActive = false;
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
              // set _id to 0 if no programs are being set to active
              const id = (data) ? data._id: 0;
              this.climateservice.selectProgram(id);
              // this.climateservice.selectPreProgrammed(id)
              //   .subscribe(update => {
              //     console.log("Updated", update);
              //     this.getClimateControlData();
              //   }, err => this.errMsg = err);
            });
            modal.present();
          }
        },
        {
          text: 'Create a New Program',
          handler: () => {
            console.log("Create a New Program");
            if (this.climateservice.isMaxPrograms(this.programs.length)) {
              // start creation modal
              const modal = this.modalCtrl.create(CreateProgramPage);
              modal.onDidDismiss(data => {
                if (data) {
                  console.log("Valid", data);
                  this.climateservice.addNewProgram(data);
                  // this.climateservice.addProgram(data)
                  //   .subscribe(program => {
                  //     console.log("Added program", program);
                  //     this.getClimateControlData();
                  //   }, err => this.errMsg = err);
                }
              });
              modal.present();
            }
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
                console.log("Valid", data);
                this.climateservice.updateSelectedProgram(data);
                // this.climateservice.updateSelectedProgram(data)
                //   .subscribe(program => {
                //     console.log("Updated program", program);
                //     this.getClimateControlData();
                //   }, err => this.errMsg = err);
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

  // climate control action sheet for mode override: COOL, HEAT, FAN, OFF
  openModeActionSheet() {
    const actionSheet = this.actionsheetCtrl.create({
      title: 'Select Mode',
      buttons: [
        {
          text: 'COOL',
          handler: () => {
            this.updateTargetMode('COOL');
          }
        },
        {
          text: 'HEAT',
          handler: () => {
            this.updateTargetMode('HEAT');
          }
        },
        {
          text: 'FAN',
          handler: () => {
            this.updateTargetMode('FAN');
          }
        },
        {
          text: 'OFF',
          handler: () => {
            this.updateTargetMode('OFF');
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

  // login modal if not authenticated, will refresh climate control page on login
  openLoginModal() {
    console.log("Climate control modal");
    const modal = this.modalCtrl.create(LoginPage);
    modal.onDidDismiss(data => {
      if (data !== undefined) {
        this.navCtrl.setRoot(ClimatecontrolPage);
      }
    });
    modal.present();
  }

}
