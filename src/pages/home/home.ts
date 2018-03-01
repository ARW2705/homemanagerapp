import { Component, OnInit, Inject } from '@angular/core';
import { NavController, ActionSheetController, ModalController, ToastController } from 'ionic-angular';

import { Climate } from '../../shared/climate';
import { GarageDoor } from '../../shared/garagedoor';
import { minTemperature, maxTemperature } from '../../shared/temperatureconst';

import { ClimateProvider } from '../../providers/climate/climate';
import { GarageDoorProvider } from '../../providers/garage-door/garage-door';
import { WebsocketConnectionProvider } from '../../providers/websocket-connection/websocket-connection';

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
  errMsg: string;
  garageDoor: GarageDoor;
  unitType: string = 'e';
  desiredTemperature: number;
  program: string;
  private socket;

  constructor(public navCtrl: NavController,
    private climateservice: ClimateProvider,
    private garageDoorService: GarageDoorProvider,
    private actionsheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,
    private wssConnection: WebsocketConnectionProvider,
    @Inject('baseURL') private baseURL,
    @Inject('minTemperature') private minTemperature,
    @Inject('maxTemperature') private maxTemperature) {
    }

  ngOnInit() {
    this.getInitialHomeData();
    this.wssConnection.getSocket()
      .subscribe(socket => {
        console.log('Home connection to socket established', socket);
        this.socket = socket;
        this.climateservice.listenForClimateData(socket)
          .subscribe(data => {
            console.log('Incoming climate data from server', data);
            this.handleWebsocketData(data);
          });
        this.garageDoorService.listenForGarageDoorData(socket)
          .subscribe(data => {
            console.log('Incoming garage door data from server', data);
            this.handleWebsocketData(data);
          })
      });
  }

  // get data for each page summary
  getInitialHomeData() {
    this.climateservice.getInitialClimateData()
      .subscribe(climate => {
        this.desiredTemperature = climate.targetTemperature;
        this.climate = climate;
        }, err => this.errMsg = err);
    this.climateservice.getClimatePrograms()
      .subscribe(programs => {
        const active = programs.filter(program => program.isActive);
        if (active.length) {
          this.program = active[0].name;
        } else {
          this.program = "NONE SELECTED";
        }
      }, err => this.errMsg = err);
    this.garageDoorService.getGarageDoorStatus()
      .subscribe(status => {
        this.garageDoor = status;
      }, err => this.errMsg = err);
  }

  handleWebsocketData(data: any) {
    const method = data.type;
    const result = data.data;
    switch (method) {
      case 'climate-data':
        this.desiredTemperature = result.targetTemperature;
        this.climate = result;
        console.log('New climate data posted');
        break;
      case 'select-program':
        this.program = (result != null) ? result.name: "None Selected";
        console.log('Selected program:', result);
        break;
      case 'garage-door':
        this.garageDoor = result;
        console.log('New door status', result);
        break;
      case 'error':
        // this.errMsg = result;
        console.log('Encountered an error', result);
        break;
      default:
        console.log('Supplied method is not valid');
        break;
    }
  }

  /* target temperature selection slider - will stop any active programs
    and set new target temperature - other parameters will be unchanged
    unless thermostat status changes */
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
            this.climateservice.getClimatePrograms()
              .subscribe(programs => {
                // start creation modal
                const modal = this.modalCtrl.create(CreateProgramPage);
                modal.onDidDismiss(data => {
                  if (data) {
                    console.log("Valid", data);
                    this.climateservice.addNewProgram(data);
                  }
                });
                modal.present();
              });
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
    console.log("Home modal");
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
    this.climateservice.updateClimateParameters(this.desiredTemperature);
  }

  operateGarageDoor() {
    const action = (this.garageDoor.targetPosition == "OPEN") ? "CLOSED": "OPEN";
    this.garageDoorService.operateGarageDoor(action);
  }

}
