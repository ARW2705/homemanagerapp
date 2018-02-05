import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { minTemperature, maxTemperature } from '../../shared/temperatureconst';

@IonicPage()
@Component({
  selector: 'page-scheduler',
  templateUrl: 'scheduler.html',
})
export class SchedulerPage {

  viewReview: boolean = false;
  schedule: Array<number> = Array.from({length: 112}, (_, i) => -1);
  days: Array<string>;
  stringDays: Array<string> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  index: Array<number> = [0, 1, 2, 3];
  hours: Array<number> = Array.from(Array(24).keys());
  minutes: Array<number> = [0, 15, 30, 45];
  temps: Array<number> = Array.from({length: (maxTemperature - minTemperature + 1)}, (_, i) => minTemperature + i);
  zones: Array<number> = [0, 1, 2, 3];
  defaultHour: number = 12;
  defaultMinute: number = 0;
  defaultTemp: number = 70;
  defaultZone: number = 0;
  hour: Array<number> = Array.from({length: 4}, (_, i) => this.defaultHour);
  minute: Array<number> = Array.from({length: 4}, (_, i) => this.defaultMinute);
  temp: Array<number> = Array.from({length: 4}, (_, i) => this.defaultTemp);
  zone: Array<number> = Array.from({length: 4}, (_, i) => this.defaultZone);
  daysError: boolean = false;
  providedSchedule: boolean = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController) {
      if (navParams.get('program')) {
        console.log("Scheduler received: ", navParams.get('program'));
        const toBeUpdated = navParams.get('program');
        this.schedule = toBeUpdated.program;
        this.providedSchedule = true;
      }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchedulerPage');
  }

  tester() {
    console.log(this.days);
    console.log(this.hour);
    console.log(this.minute);
    console.log(this.temp);
    console.log(this.zone);
  }

  clearModal() {
    this.days = [];
    this.hour = this.hour.map(i => this.defaultHour);
    this.minute = this.minute.map(i => this.defaultMinute);
    this.temp = this.temp.map(i => this.defaultTemp);
    this.zone = this.zone.map(i => this.defaultZone);
  }

  pushScheduleValues() {
    if (!this.days) {
      console.log("No day(s) selected");
      this.daysError = true;
      return;
    }
    this.daysError = false;
    for (let i=0; i<7; i++) {
      if (this.days.indexOf(i.toString()) != -1) {
        for (let j=0; j<4; j++) {
          this.schedule[i * 16 + j * 4] = this.hour[j];
          this.schedule[i * 16 + j * 4 + 1] = this.minute[j];
          this.schedule[i * 16 + j * 4 + 2] = this.temp[j];
          this.schedule[i * 16 + j * 4 + 3] = this.zone[j];
        }
      }
    }
    this.clearModal();
    console.log(this.schedule);
    if (this.isScheduleValid) {
      this.viewReview = true;
    }
  }

  toggleDisplaySchedule() {
    this.viewReview = (this.viewReview) ? false: true;
  }

  isScheduleValid() {
    return (this.schedule.indexOf(-1) === -1) ? true: false;
  }

  onSubmit() {
    this.viewCtrl.dismiss(this.schedule);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
