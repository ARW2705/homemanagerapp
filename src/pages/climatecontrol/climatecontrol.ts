import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ModalController, ToastController } from 'ionic-angular';
import { Slides } from 'ionic-angular';

import { Climate } from '../../shared/climate';
import { ClimateProgram } from '../../shared/climateprogram';
import { Sensor } from '../../shared/sensor';

import { ClimateProvider } from '../../providers/climate/climate';
import { WebsocketConnectionProvider } from '../../providers/websocket-connection/websocket-connection';

import { CreateProgramPage } from '../program-crud-operations/create-program/create-program';
import { LoginPage } from '../login/login';
import { SelectProgramPage } from '../program-crud-operations/select-program/select-program';
import { UpdateProgramPage } from '../program-crud-operations/update-program/update-program';

@IonicPage()
@Component({
  selector: 'page-climatecontrol',
  templateUrl: 'climatecontrol.html',
})
export class ClimatecontrolPage implements OnInit {

  @ViewChild('climateSlide') slides: Slides;
  errMsg: string;
  unitType: string = "e";
  currentTemperature: number;
  selectedZone: number = 0;
  targetTemperature: number;
  climate: Climate;
  programs: Array<ClimateProgram>;
  selectedProgram: ClimateProgram | any;
  zones: Array<Sensor>;
  private socket;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private climateservice: ClimateProvider,
    private toastCtrl: ToastController,
    private actionsheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    private wssConnection: WebsocketConnectionProvider,
    @Inject('minTemperature') private minTemperature,
    @Inject('maxTemperature') private maxTemperature) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClimatecontrolPage');
  }

  ngOnInit() {
    // get initial data via http
    this.getInitialClimateData();
    // define websocket and subscribe to listener
    try {
      this.wssConnection.getSocket()
        .subscribe(socket => {
          console.log('Climate control connection to socket established', socket);
          this.socket = socket;
          // socket listener for climate control
          this.climateservice.listenForClimateData(socket)
            .subscribe(data => {
              console.log('Incoming data from server', data);
              this.handleWebsocketData(data);
            });
        });
      // after 5 sec delay, check that app has received a message from the thermostat
      // if not, send ping to thermostat to emit data
      setTimeout(() => {
        if (!this.climateservice.isThermostatConnected) {
          console.log('Thermostat not verified, retrying...');
          this.climateservice.pingThermostat();
        }
      }, 5000);
    } catch(e) {
      console.log('Socket connection error', e);
    }
  }

  /* Server listeners */

  // get climate and climate program data
  getInitialClimateData() {
    this.climateservice.getInitialClimateData()
      .subscribe(climate => {
        this.targetTemperature = climate.targetTemperature;
        this.zones = climate.zoneData;
        this.climate = climate;
      }, err => this.errMsg = err);
    this.climateservice.getClimatePrograms()
      .subscribe(programs => {
        console.log(programs);
        this.programs = programs;
        this.selectedProgram = programs.filter(program => program.isActive)[0]
          || {name: "None Selected", isActive: false};
      }, err => this.errMsg = err);
  }

  // handler for results from websocket listeners
  handleWebsocketData(data: any) {
    const method = data.type;
    const result = data.data;
    switch (method) {
      // system communication events
      // thermostat disconnected from server
      case 'thermostat-disconnected':
        console.log('Thermostat disconnected from server at:', result.disconnectedAt);
        break;

      // climate system events
      // new climate data from thermostat
      case 'climate-data':
        this.targetTemperature = result.targetTemperature;
        this.zones = result.zoneData;
        this.climate = result;
        console.log('New climate data posted');
        break;
      // new pre-programmed schedule created and becomes selected if specified by user
      case 'new-program':
        this.programs.push(result);
        this.selectedProgram = this.programs.filter(program => program.isActive)[0]
          || {name: 'None Selected', isActive: false};
        console.log('New climate program created');
        break;
      // a program was selected to be run by an app client
      case 'select-program':
        this.selectedProgram = result || {name: "None Selected", isActive: false};
        console.log('Selected program');
        break;
      // a program was updated
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
      // a program was deleted, if it was running, selected program is set to none
      case 'delete-program':
        // TODO implement program deletion handler
        console.log('Program has been deleted');
        break;

      // system events
      // error event TODO handle error if retries have failed
      case 'error':
        // this.errMsg = result;
        console.log('Encountered an error');
        break;
      default:
        console.log('Supplied method is not valid');
        break;
    }
  }

  /* Template actions */

  // show updating messages while GET request is in progress
  displayLoading() {
    this.climate.operatingStatus = "UPDATING";
    this.climate.selectedMode = "UPDATING";
    this.selectedProgram.isActive = false;
  }

  // set html unicode for degrees fahrenheit or celsius
  getTemperatureSymbol() {
    return (this.unitType === 'm') ? "&#8451": "&#8457";
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
                this.climateservice.addNewProgram(data);
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
                console.log("Valid", data);
                this.climateservice.updateSelectedProgram(data);
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
    console.log("Climate control modal");
    const modal = this.modalCtrl.create(LoginPage);
    modal.onDidDismiss(data => {
      if (data !== undefined) {
        this.navCtrl.setRoot(ClimatecontrolPage);
      }
    });
    modal.present();
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

  /* Climate utility functions */

  // override set mode, any active program will be set to inactive
  updateTargetMode(mode: string) {
    this.climateservice.updateClimateParameters(null, mode);
  }

  // override set temperature, any active program will be set to inactive
  updateTargetTemperature() {
    console.log('socket', this.socket);
    this.climateservice.updateClimateParameters(this.targetTemperature);
  }

}
