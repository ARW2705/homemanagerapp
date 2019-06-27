import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, NavParams, ActionSheetController, ModalController, ToastController } from 'ionic-angular';
import { Slides } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { Climate, ControlParams } from '../../shared/climate';
import { ClimateProgram } from '../../shared/climateprogram';
import { Sensor } from '../../shared/sensor';
import { minTemperature, maxTemperature } from '../../shared/temperatureconst';

import { ClimateProvider } from '../../providers/climate/climate';
import { LocalNodeProvider } from '../../providers/local-node/local-node';
import { WebsocketConnectionProvider } from '../../providers/websocket-connection/websocket-connection';

import { CreateProgramPage } from '../program-crud-operations/create-program/create-program';
import { LoginPage } from '../login/login';
import { SelectProgramPage } from '../program-crud-operations/select-program/select-program';
import { UpdateProgramPage } from '../program-crud-operations/update-program/update-program';
import { ZoneNamePage } from '../zone-name/zone-name';

@Component({
  selector: 'page-climatecontrol',
  templateUrl: 'climatecontrol.html',
})
export class ClimatecontrolPage implements OnInit {

  @ViewChild('climateSlide') slides: Slides;
  private climate: Climate = null;
  private controlParams: ControlParams;
  private currentTemperature: number;
  private displayOperatingStatus: string;
  private displaySetMode: string;
  private errMsg: string;
  private isClimateLoaded: boolean = false;
  private isProgramLoaded: boolean = false;
  private noProgramSelected = {name: 'None Selected', isActive: false};
  private selectedProgram: ClimateProgram | any = this.noProgramSelected;
  private zoneIndex: number = 0;
  private setTemperature: number;
  private socket;
  private sleep: boolean = false;
  private thermostatDisconnectMsg: string;
  private unitType: string = "e";
  private zones: Array<Sensor>;
  private _unsubscribe: Subject<void> = new Subject<void>();

  public minTemperature: number;
  public maxTemperature: number;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private climateService: ClimateProvider,
    private localNodeService: LocalNodeProvider,
    private toastCtrl: ToastController,
    private actionsheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    private wssConnection: WebsocketConnectionProvider) {
      this.minTemperature = minTemperature;
      this.maxTemperature = maxTemperature;
      this.controlParams = {
        setTemperature: 70,
        setMode: 'OFF',
        setZoneDeviceId: 0,
        sleep: false
      };
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClimatecontrolPage');
  }

  ngOnInit() {
    // define websocket and subscribe to listener
    try {
      this.wssConnection.getSocket()
        .takeUntil(this._unsubscribe)
        .subscribe(socket => {
          console.log('Climate control connection to socket established');
          this.socket = socket;
          // socket listener for climate control
          this.climateService.listenForClimateData(socket)
            .takeUntil(this._unsubscribe)
            .subscribe(data => {
              console.log('Incoming data from server');
              this.handleWebsocketData(data);
            });
        });
    } catch(e) {
      console.log('Socket connection error', e);
    }
    this.climateService.setReconnectMonitorInterval();
  }

  ionViewDidLeave() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  /* Server listeners */

  // handler for results from websocket listeners
  handleWebsocketData(data: any) {
    const method = data.type;
    const result = data.data;
    switch (method) {
      case 'connection':
        if (result.connectedAt) {
          this.thermostatDisconnectMsg = '';
          this.climateService.clearReconnectMonitorInterval();
        } else if (result.disconnectedAt) {
          this.thermostatDisconnectMsg = `Thermostat disconnected at ${result.disconnectedAt}`;
          this.climateService.setReconnectMonitorInterval();
        } else {
          console.log('Unknown connection message');
        }
        console.log('New connection data');
        break;
      case 'climate':
        console.log(result);
        this.climate = result;
        this.controlParams.setMode = this.climate.setMode;
        this.controlParams.setTemperature = this.climate.setTemperature;
        this.controlParams.setZoneDeviceId = this.climate.setZoneDeviceId;
        this.zoneIndex = this.climateService.getZoneIndex(this.climate.setZoneDeviceId);
        console.log('New climate data');
        break;
      case 'programs':
      console.log('programs', result);
        this.isProgramLoaded = true;
        console.log('All programs');
        break;
      case 'program-status':
        const active = this.climateService.getPrograms().find(program => program.isActive);
        console.log('active', active);
        this.selectedProgram = active || this.noProgramSelected;
        console.log('Program selection complete');
        break;
      case 'error':
        this.errMsg = result.data;
        break;
      default:
        console.log('Supplied method is not available for CLIMATE, this is not an error');
        break;
    }
  }

  displayLoading() {
    this.displayOperatingStatus = "UPDATING";
    this.displaySetMode = "UPDATING";
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
              this.climateService.selectProgram(id);
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
                this.climateService.addNewProgram(data);
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
                this.climateService.updateSelectedProgram(data);
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

  // zone name form modal
  openZoneNameModal(zone: Sensor) {

    const modal = this.modalCtrl.create(
      ZoneNamePage,
      {oldName: zone.locationName},
      {cssClass : 'zone-name-modal'}
    );
    modal.onDidDismiss(data => {
      if (data !== undefined) {
        this.climateService.setZoneName({
          deviceId: zone.deviceId,
          name: data
        });
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

  openZoneActionSheet() {
    const sheetButtons = [];
    for (let i=0; i < this.climate.zoneData.length; i++) {
      sheetButtons.push({
        text: `${this.climate.zoneData[i].locationName}`,
        handler: () => {
          this.updateTargetZone(this.climate.zoneData[i].deviceId);
        }
      });
    }
    sheetButtons.push({
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log("Mode selection cancelled");
      }
    })
    const actionSheet = this.actionsheetCtrl.create({
      title: 'Select Zone',
      buttons: sheetButtons
    });
    actionSheet.present();
  }

  // TODO create zone setup modal

  /* target temperature selection slider - will stop any active programs
    and set new target temperature - other parameters will be unchanged
    unless thermostat status changes */
  onSliderChangeEnd() {
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
    this.controlParams.setMode = mode;
    this.climateService.updateClimateParameters(this.controlParams);
  }

  // override set temperature, any active program will be set to inactive
  updateTargetTemperature() {
    this.controlParams.setTemperature = this.climate.setTemperature;
    this.climateService.updateClimateParameters(this.controlParams);
  }

  updateTargetZone(deviceId: number) {
    console.log(this.controlParams.setZoneDeviceId);
    this.controlParams.setZoneDeviceId = deviceId;
    console.log(this.controlParams.setZoneDeviceId, deviceId);
    this.climateService.updateClimateParameters(this.controlParams);
    console.log(this.controlParams.setZoneDeviceId, deviceId);
  }

}
