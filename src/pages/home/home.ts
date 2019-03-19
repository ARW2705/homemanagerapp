import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController, ModalController } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

// import interfaces and constants
import { videoBaseURL } from '../../shared/videourl';
import { VideoMetaData } from '../../shared/videodata';
import { Climate, ControlParams } from '../../shared/climate';
import { GarageDoor } from '../../shared/garagedoor';
import { minTemperature, maxTemperature } from '../../shared/temperatureconst';

// import providers
import { ClimateProvider } from '../../providers/climate/climate';
import { GarageDoorProvider } from '../../providers/garage-door/garage-door';
import { LocalNodeProvider } from '../../providers/local-node/local-node';
import { WebsocketConnectionProvider } from '../../providers/websocket-connection/websocket-connection';
import { SecCamProvider } from '../../providers/sec-cam/sec-cam';
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

  private desiredTemperature: number = (maxTemperature + minTemperature) / 2;
  private errMsg: string;
  private thermostatDisconnectMsg: string;
  private programName: string;
  private unitType: string = 'e';
  private garageDoor: GarageDoor;
  private isClimateLoaded: boolean = false;
  private isProgramLoaded: boolean = false;
  private isGarageDoorLoaded: boolean = false;
  private isSecCamLoaded: boolean = false;
  private socket;
  private minTemperature = minTemperature;
  private maxTemperature = maxTemperature;
  private _unsubscribe: Subject<void> = new Subject<void>();
  private videoURL: string = '';
  private video: VideoMetaData = null;
  private controlParams: ControlParams;

  constructor(public navCtrl: NavController,
    private localNodeService: LocalNodeProvider,
    private climateservice: ClimateProvider,
    private garageDoorService: GarageDoorProvider,
    private actionsheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    private wssConnection: WebsocketConnectionProvider,
    private secCamService: SecCamProvider,
    private authService: AuthenticationProvider) {
      this.controlParams = {
        setTemperature: 70,
        setMode: 'OFF',
        setZone: 0,
        sleep: false
      };
    }

  ngOnInit() {
    // get initial data via http
    this.getInitialHomeData();
    // define websocket and subscribe to listeners
    try {
      this.wssConnection.getSocket()
        .takeUntil(this._unsubscribe)
        .subscribe(socket => {
          console.log('Home connection to socket established', socket);
          this.socket = socket;

          // socket listener for climate control
          this.climateservice.listenForClimateData(socket)
            .takeUntil(this._unsubscribe)
            .subscribe(data => {
              console.log('Incoming climate or program data from server', data);
              this.handleWebsocketData(data);
            });

          // socket listener for garage door
          this.garageDoorService.listenForGarageDoorData(socket)
            .takeUntil(this._unsubscribe)
            .subscribe(data => {
              console.log('Incoming garage door data from server', data);
              this.handleWebsocketData(data);
            });

          // socket listener for seccam video
          this.secCamService.listenForSecCamData(socket)
            .takeUntil(this._unsubscribe)
            .subscribe(data => {
              console.log('Incoming sec cam data from server');
              this.handleWebsocketData(data);
            });

          // request latest security camera video
          this.secCamService.getVideoFilenames({
            startDateTime: '', endDateTime: '', event: 'all', starred: false, limit: 1
          });
        });
      } catch(e) {
        console.log('Socket connection error', e);
      }
      this.climateservice.setReconnectMonitorInterval();
  }

  ionViewDidLeave() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  /* Server listeners */

  // get data for each page summary
  getInitialHomeData() {
    this.garageDoorService.getGarageDoorStatus()
      .subscribe(status => {
        this.garageDoor = status;
      }, err => { console.log('init-garage', err); this.errMsg = err });
  }

  // handler for results from websocket listeners
  handleWebsocketData(data: any) {
    const method = data.type;
    const result = data.data;
    let tempProgram;
    switch (method) {
      case 'connection':
        if (result.connectedAt) {
          this.thermostatDisconnectMsg = '';
          this.climateservice.clearReconnectMonitorInterval();
        } else if (result.disconnectedAt) {
          this.thermostatDisconnectMsg = `Thermostat disconnected at ${result.disconnectedAt}`;
          this.climateservice.setReconnectMonitorInterval();
        } else {
          console.log('Unknown connection message');
        }
        console.log('New connection data');
        break;
      case 'climate':
        this.desiredTemperature = result.setTemperature;
        this.isClimateLoaded = true;
        console.log('New climate data');
        break;
      case 'programs':
        tempProgram = this.climateservice.getPrograms().find(program => program.isActive);
        this.programName = tempProgram ? tempProgram.name: 'None Selected';
        this.isProgramLoaded = true;
        console.log('All programs');
        break;
      case 'program-status':
        tempProgram = this.climateservice.getPrograms().find(program => program.isActive);
        this.programName = tempProgram ? tempProgram.name: 'None Selected';
        console.log('Program selection complete');
        break;

      // garage door events
      // updated status of garage door eiter from user operation in an app
      // client or a condition change from the garage door
      case 'garage-door':
        this.garageDoor = result;
        console.log('New door status', result);
        break;
      // seccam events
      case 'video-list':
        this.video = result[0];
        const token = this.authService.getToken();
        this.videoURL = `${videoBaseURL}${result[0].filename}/?vidauth=${token}`;
        this.isSecCamLoaded = true;
        break;
      // system events
      // error event TODO handle error if retries have failed
      case 'error':
        this.errMsg = result;
        console.log('Encountered an error', result);
        break;
      default:
        console.log('Supplied method is not available for HOME, this is not an error');
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
    this.controlParams.setTemperature = this.desiredTemperature;
    this.climateservice.updateClimateParameters(this.controlParams);
  }

  /* Garage door utility functions */

  // toggle target position of garage door and emit event to garage door and other client apps
  operateGarageDoor() {
    const action = (this.garageDoor.targetPosition == "OPEN") ? "CLOSED": "OPEN";
    this.garageDoorService.operateGarageDoor(action);
  }

}
