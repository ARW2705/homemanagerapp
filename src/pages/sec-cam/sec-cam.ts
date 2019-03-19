import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, PopoverController } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';

import { videoBaseURL } from '../../shared/videourl';
import { VideoMetaData } from '../../shared/videodata';

import { WebsocketConnectionProvider } from '../../providers/websocket-connection/websocket-connection';
import { SecCamProvider } from '../../providers/sec-cam/sec-cam';
import { AuthenticationProvider } from '../../providers/authentication/authentication';

import { VideoQueryFormPage } from '../video-query-form/video-query-form';
import { VideoOptionsPopoverPage } from '../video-options-popover/video-options-popover';

@Component({
  selector: 'page-sec-cam',
  templateUrl: 'sec-cam.html',
})
export class SecCamPage implements OnInit {

  private videoNameList: VideoMetaData[] = [];
  private selectedVideo: VideoMetaData = null;
  private isRecording = false;
  private classRecording = '';
  private recordDisplay = 'Record';
  private recordingProcessing = false;
  private videoURL: String = '';
  private _unsubscribe: Subject<void> = new Subject<void>();
  private socket;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private secCamService: SecCamProvider,
    private wssConnection: WebsocketConnectionProvider,
    private authService: AuthenticationProvider,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public popoverCtrl: PopoverController) { }

  ngOnInit() {
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
        });
    } catch(e) {
      console.log('Socket connection error', e);
    }
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
        console.log('Stream data available', result);
        this.videoNameList = result;
        if (result.length) {
          this.selectVideo(this.videoNameList[0].filename, 0);
        }
        break;
      case 'new-video':
        if (result) {
          this.videoNameList.unshift(result);
        }
        this.recordingProcessing = false;
        break;
      case 'updated-metadata':
        if (result) {
          const toUpdate = this.videoNameList.findIndex(index => result._id == index._id);
          console.log(toUpdate);
          this.videoNameList[toUpdate] = result;
          this.selectedVideo = result;
        }
      case 'video-deleted':
        // TODO handle updating lists after file was deleted from server
        break;
      case 'error':
        // TODO add error feedback handling
        console.log('Encountered an error', result);
        break;
      default:
        console.log('Supplied method is not available for SECURITY CAMERA, this is not an error');
        break;
    }
  }

  selectVideo(filename, index) {
    this.selectedVideo = this.videoNameList[index];
    const token = this.authService.getToken();
    this.videoURL = `${videoBaseURL}${filename}/?vidauth=${token}`;
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

  toggleStarred() {
    this.secCamService.toggleStarred(this.selectedVideo._id, !this.selectedVideo.starred);
  }

  openQueryModal() {
    const modal = this.modalCtrl.create(VideoQueryFormPage);
    modal.onDidDismiss(data => {
      if (data) {
        this.secCamService.getVideoFilenames(data);
      }
    });
    modal.present();
  }

  openOptionsPopover() {
    const popover = this.popoverCtrl.create(
      VideoOptionsPopoverPage,
      {list: this.videoNameList},
      {cssClass: 'video-options-popover'}
    );
    popover.onDidDismiss(data => {
      if (data && data.filename) {
        this.selectVideo(data.filename, data.index);
      }
    });
    popover.present();
  }

}
