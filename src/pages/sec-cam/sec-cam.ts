import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';

import { baseURL } from '../../shared/baseurl';
import { apiVersion } from '../../shared/apiVersion';

import { WebsocketConnectionProvider } from '../../providers/websocket-connection/websocket-connection';
import { SecCamProvider } from '../../providers/sec-cam/sec-cam';
import { AuthenticationProvider } from '../../providers/authentication/authentication';

@IonicPage()
@Component({
  selector: 'page-sec-cam',
  templateUrl: 'sec-cam.html',
})
export class SecCamPage implements OnInit {

  private videoNameList: String[] = [];
  private isRecording = false;
  private classRecording = '';
  private recordDisplay = 'Record';
  // TODO update for dynamic location name
  private locationName = 'Front-door';
  private recordingProcessing = false;
  private videoBaseURL: String = `${baseURL}${apiVersion}security/seccam/`;
  private videoURL: String = '';
  private _unsubscribe: Subject<void> = new Subject<void>();
  private socket;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private secCamService: SecCamProvider,
    private wssConnection: WebsocketConnectionProvider,
    private authService: AuthenticationProvider) { }

  ngOnInit() {
    this.initCameraFiles();
    try {
      this.wssConnection.getSocket()
        .takeUntil(this._unsubscribe)
        .subscribe(socket => {
          console.log('Security viewer connection to socket established');
          this.socket = socket;
          // socket listener for security cameras
          this.secCamService.listenForSecCamData(socket)
            .takeUntil(this._unsubscribe)
            .subscribe(data => {
              console.log('Incoming data from server');
              this.handleWebsocketData(data);
            });
          // setTimeout(() => {
          //   this.secCamService.getCameraFileNames();
          // }, 1000);
        });
    } catch(e) {
      console.log('Socket connection error', e);
    }
  }

  initCameraFiles() {
    this.secCamService.getCameraFileNames()
      .subscribe(filenames => {
        console.log(filenames);
        this.videoNameList = filenames.reverse();
        this.selectVideo(this.videoNameList[0]);
        // this.videoURL = `${this.videoBaseURL}${this.videoNameList[0]}`;
      }, err => console.log(err));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SecCamPage');
  }

  ionViewDidLeave() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  handleWebsocketData(data: any) {
    const method = data.type;
    const result = data.data;
    switch (method) {
      case 'video-list':
        console.log('Stream data available');
        this.videoNameList = result.reverse();
        this.selectVideo(this.videoNameList[0]);
        this.recordingProcessing = false;
        break;
      case 'error':
        // this.errMsg = result;
        console.log('Encountered an error', result);
        break;
      default:
        console.log('Supplied method is not available for CLIMATE, this is not an error');
        break;
    }
  }

  selectVideo(event) {
    console.log(event);
    const token = this.authService.getToken();
    this.videoURL = `${this.videoBaseURL}${event}/?vidauth=${token}`;
  }

  toggleRecording() {
    this.isRecording = !this.isRecording;
    if (!this.isRecording) {
      this.recordingProcessing = true;
    }
    this.classRecording = this.isRecording ? 'in-progress': '';
    this.recordDisplay = this.isRecording ? 'Stop Recording': 'Record';
    this.secCamService.toggleRecording(this.isRecording);
    console.log(`Recording has ${this.isRecording ? 'started': 'ended'}`);
  }

}
