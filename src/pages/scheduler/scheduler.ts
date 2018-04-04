import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { Climate } from '../../shared/climate';
import { Sensor } from '../../shared/sensor';
import { ClimateProvider } from '../../providers/climate/climate';
import { minTemperature, maxTemperature } from '../../shared/temperatureconst';

@IonicPage()
@Component({
  selector: 'page-scheduler',
  templateUrl: 'scheduler.html',
})
export class SchedulerPage implements OnInit {

  climate: Climate;
  viewReview: boolean = false;
  schedule: Array<number> = Array.from({length: 112}, (_, i) => -1);
  days: Array<string>;
  dayToModify: number;
  stringDays: Array<string> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  temps: Array<number> = Array.from({length: (maxTemperature - minTemperature + 1)}, (_, i) => maxTemperature - i);
  zones: Array<string>;
  defaultTime: string = "2000-01-01T08:00:00Z";
  defaultTemp: number = 70;
  defaultZone: string = "";
  time: Array<string> = Array.from({length: 4}, (_, i) => this.defaultTime);
  temp: Array<number> = Array.from({length: 4}, (_, i) => this.defaultTemp);
  zone: Array<string>;
  importArray: Array<number>;
  daysError: boolean = false;
  providedSchedule: boolean = false;
  modify: boolean = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private climateService: ClimateProvider) {
      if (navParams.get('program')) {
        console.log("Scheduler received: ", navParams.get('program'));
        const toBeUpdated = navParams.get('program');
        this.schedule = toBeUpdated.program;
        this.providedSchedule = true;
      }
      if (navParams.get('newSchedule')) {
        console.log("Program creation schedule received: ", navParams.get('newSchedule'));
        const populateSchedule = navParams.get('newSchedule');
        this.schedule = populateSchedule;
        this.providedSchedule = true;
      }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchedulerPage');
  }

  ngOnInit() {
    this.climateService.getInitialClimateData()
      .subscribe(climate => {
        this.climate = climate;
        this.defaultZone = this.climate.zoneData[0].locationName;
        this.zone = Array.from({length: 4}, (_, i) => this.defaultZone);
        this.zones = this.climate.zoneData.map(zone => zone.locationName);
      }, err => console.log(err));
  }

  // reset schedule values to default
  clearModal() {
    this.days = [];
    this.dayToModify = 0;
    this.time = this.time.map(i => this.defaultTime);
    this.temp = this.temp.map(i => this.defaultTemp);
    this.zone = this.zone.map(i => this.defaultZone);
  }

  // add selected data points to program schedule array,
  // must have at least one day selected
  pushScheduleValues() {
    if (!this.days) {
      console.log("No day(s) selected");
      this.daysError = true;
      return;
    }
    this.daysError = false;
    for (let i=0; i<7; i++) {
      if (this.days.indexOf(i.toString()) != -1) {
        this.populateScheduleForOneDay(i);
        // for (let j=0; j<4; j++) {
        //   let inputTime = new Date(this.time[j]);
        //   let _hours = inputTime.getHours() + 8;
        //   this.schedule[i * 16 + j * 4] = (_hours < 24) ? _hours: 0;
        //   this.schedule[i * 16 + j * 4 + 1] = inputTime.getMinutes();
        //   this.schedule[i * 16 + j * 4 + 2] = this.temp[j];
        //   this.schedule[i * 16 + j * 4 + 3] = this.zoneNameToInt(this.zone[j]);
        // }
      }
    }
    this.clearModal();
    console.log(this.schedule);
    if (this.isScheduleValid) {
      this.viewReview = true;
    }
  }

  populateScheduleForOneDay(day: number) {
    for (let j=0; j<4; j++) {
      let inputTime = new Date(this.time[j]);
      let _hours = inputTime.getHours() + 8;
      this.schedule[day * 16 + j * 4] = (_hours < 24) ? _hours: 0;
      this.schedule[day * 16 + j * 4 + 1] = inputTime.getMinutes();
      this.schedule[day * 16 + j * 4 + 2] = this.temp[j];
      this.schedule[day * 16 + j * 4 + 3] = this.zoneNameToInt(this.zone[j]);
    }
  }

  // toggle between schedule selection view and current selected values review
  toggleDisplaySchedule() {
    this.viewReview = (this.viewReview) ? false: true;
  }

  modifyOneDay(dayIndex: number) {
    this.modify = true;
    this.dayToModify = dayIndex;
    this.toggleDisplaySchedule();
  }

  // return true if all values have been assigned
  isScheduleValid() {
    return (this.schedule.indexOf(-1) === -1) ? true: false;
  }

  onSubmit() {
    this.viewCtrl.dismiss(this.schedule);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  zoneNameToInt(zoneName: string): number {
    let matched = this.climate.zoneData.find(zone => {
      return zone.locationName == zoneName
    });
    return matched.locationId;
  }

  convertTo12HR(hour: number) {
    if (!hour) return 12;
    else if (hour < 13) return hour;
    else return hour - 12;
  }

  convertTime(i: number, j: number): string {
    const hour = this.schedule[i * 16 + j * 4];
    const convertedHour = (!hour) ? 24: hour;
    const minute = this.schedule[i * 16 + j * 4 + 1];
    const ISOhour = ((convertedHour < 10) ? "0": "") + convertedHour;
    const ISOminute = ((minute < 10) ? "0": "") + minute;
    return `2000-01-01T${ISOhour}:${ISOminute}:00`;
  }

  getSchedulePointByIndex(i: number, j: number, mod: number): number {
    return this.schedule[i * 16 + j * 4 + mod];
  }

  getZoneName(id: number): string {
    return this.zones[id];
  }

  updateOneDay() {
    const day = this.schedule[this.dayToModify * 16];
    this.populateScheduleForOneDay(day);
    this.modify = false;
    this.toggleDisplaySchedule();
  }

}
