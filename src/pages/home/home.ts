import { Component, OnInit, Inject } from '@angular/core';
import { NavController, ActionSheetController, ModalController, ToastController } from 'ionic-angular';

// import interfaces and constants
import { Climate } from '../../shared/climate';
import { GarageDoor } from '../../shared/garagedoor';
import { minTemperature, maxTemperature } from '../../shared/temperatureconst';

// import providers
import { ClimateProvider } from '../../providers/climate/climate';
import { GarageDoorProvider } from '../../providers/garage-door/garage-door';
import { WebsocketConnectionProvider } from '../../providers/websocket-connection/websocket-connection';
import { AuthenticationProvider } from '../../providers/authentication/authentication';

// import pages
import { CreateProgramPage } from '../program-crud-operations/create-program/create-program';
import { LoginPage } from '../login/login';
import { SelectProgramPage } from '../program-crud-operations/select-program/select-program';
import { UpdateProgramPage } from '../program-crud-operations/update-program/update-program';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  thermostatUptoDate: boolean = false;
  desiredTemperature: number;
  errMsg: string;
  program: string;
  unitType: string = 'e';
  climate: Climate;
  garageDoor: GarageDoor;
  private socket;

  constructor(public navCtrl: NavController,
    private climateservice: ClimateProvider,
    private garageDoorService: GarageDoorProvider,
    private actionsheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,
    private wssConnection: WebsocketConnectionProvider,
    private authService: AuthenticationProvider,
    @Inject('baseURL') private baseURL,
    @Inject('minTemperature') private minTemperature,
    @Inject('maxTemperature') private maxTemperature) {
  }

  ngOnInit() {
    // get initial data via http
    this.getInitialHomeData();
    // define websocket and subscribe to listeners
    try {
      this.wssConnection.getSocket()
        .subscribe(socket => {
          console.log('Home connection to socket established', socket);
          this.socket = socket;
          // socket listener for climate control
          this.climateservice.listenForClimateData(socket)
            .subscribe(data => {
              console.log('Incoming climate data from server', data);
              this.handleWebsocketData(data);
            });
          // socket listener for garage door
          this.garageDoorService.listenForGarageDoorData(socket)
            .subscribe(data => {
              console.log('Incoming garage door data from server', data);
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
        this.desiredTemperature = result.targetTemperature;
        this.climate = result;
        console.log('New climate data posted');
        break;
      // a program was selected to be run by an app client
      case 'select-program':
        this.program = (result != null) ? result.name: "None Selected";
        console.log('Selected program:', result);
        break;

      // garage door events
      // updated status of garage door eiter from user operation in an app
      // client or a condition change from the garage door
      case 'garage-door':
        this.garageDoor = result;
        console.log('New door status', result);
        break;

      // system events
      // error event TODO handle error if retries have failed
      case 'error':
        // this.errMsg = result;
        console.log('Encountered an error', result);
        break;
      default:
        console.log('Supplied method is not available for HOME');
        break;
    }
  }

  /* Template actions */

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

  /* target temperature selection slider - will stop any active programs
    and set new target temperature - other parameters will be unchanged
    unless thermostat status changes */
  onSliderChangeEnd() {
    console.log("Selected temperature: ", this.desiredTemperature);
    this.updateTargetTemperature();
  }

  /* Climate utility functions */

  // override set temperature, any active program will be set to inactive
  updateTargetTemperature() {
    this.climateservice.updateClimateParameters(this.desiredTemperature);
  }

  /* Garage door utility functions */

  // toggle target position of garage door and emit event to garage door and other client apps
  operateGarageDoor() {
    const action = (this.garageDoor.targetPosition == "OPEN") ? "CLOSED": "OPEN";
    this.garageDoorService.operateGarageDoor(action);
  }

}
