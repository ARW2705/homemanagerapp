import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { Climate } from '../../shared/climate';
import { ClimateProvider } from '../../providers/climate/climate';
import { minTemperature, maxTemperature } from '../../shared/temperatureconst';

@Component({
  selector: 'page-scheduler',
  templateUrl: 'scheduler.html',
})
export class SchedulerPage implements OnInit {

  private climate: Climate;
  viewReview: boolean = false;
  schedule: Array<number> = Array.from({length: 112}, (_, i) => -1);
  days: Array<string>;
  dayToModify: number;
  stringDays: Array<string> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  temps: Array<number> = Array.from({length: (maxTemperature - minTemperature + 1)}, (_, i) => maxTemperature - i);
  zones: Array<string>;
  defaultTime: Array<string> = ["2000-01-01T08:00:00", "2000-01-01T12:00:00", "2000-01-01T17:00:00", "2000-01-01T22:00:00"];
  defaultTemp: number = 70;
  defaultZone: string = "";
  time: Array<string> = this.defaultTime.slice(0);
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
    const climateData = this.climateService.getClimate();
    console.log(climateData);
    if (climateData) {
      this.climate = climateData;
      this.defaultZone = climateData.zoneData[0].locationName;
      this.zone = Array.from({length: 4}, (_, i) => this.defaultZone);
      this.zones = climateData.zoneData.map(zone => zone.locationName);
    }
  }

  // reset schedule values to default
  clearModal() {
    this.days = [];
    this.dayToModify = 0;
    this.resetTimeSectionComponents();
  }

  // reset schedule component arrays to default
  resetTimeSectionComponents() {
    this.time = this.defaultTime.slice(0);
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
      }
    }
    this.clearModal();
    console.log(this.schedule);
    if (this.isScheduleValid) {
      this.viewReview = true;
    }
  }

  // sort time periods chronologically and push values to schedule
  populateScheduleForOneDay(day: number) {
    // sort date strings in increasing order
    // this.time.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    for (let i=0; i < 4; i++) {
      const inputTime = new Date(this.trimISOString(this.time[i]));
      // TODO make timezone offset for schedule array dynamic
      const _hours = inputTime.getHours();
      this.schedule[day * 16 + i * 4] = (_hours > 23) ? _hours - 24: _hours;
      this.schedule[day * 16 + i * 4 + 1] = inputTime.getMinutes();
      this.schedule[day * 16 + i * 4 + 2] = this.temp[i];
      this.schedule[day * 16 + i * 4 + 3] = this.zoneNameToInt(this.zone[i]);
    }
  }

  // toggle between schedule selection view and current selected values review
  toggleDisplaySchedule() {
    this.viewReview = (this.viewReview) ? false: true;
  }

  modifyOneDay(dayIndex: number) {
    if (this.schedule[dayIndex * 16] != -1) {
      for (let i=0; i < 4; i++) {
        this.time[i] = this.convertTime(dayIndex, i);
        this.temp[i] = this.schedule[dayIndex * 16 + i * 4 + 2];
        this.zone[i] = this.zones[this.schedule[dayIndex * 16 + i * 4 + 3]];
      }
    } else {
      this.resetTimeSectionComponents();
    }
    console.log('ISO one day', this.time);
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
    return matched.deviceId;
  }

  convertTo12HR(hour: number) {
    if (!hour) return 12;
    else if (hour < 13) return hour;
    else return hour - 12;
  }

  convertTime(i: number, j: number): string {
    const hour = this.schedule[i * 16 + j * 4];
    const minute = this.schedule[i * 16 + j * 4 + 1];
    const ISOhour = ((hour < 10) ? "0": "") + hour;
    const ISOminute = ((minute < 10) ? "0": "") + minute;
    return `2000-01-01T${ISOhour}:${ISOminute}:00`;
  }

  getSchedulePointByIndex(i: number, j: number, mod: number): number {
    return this.schedule[i * 16 + j * 4 + mod];
  }

  getZoneName(id: number): string {
    console.log(this.zones);
    return this.zones[id];
  }

  updateOneDay() {
    this.populateScheduleForOneDay(this.dayToModify);
    this.modify = false;
    this.toggleDisplaySchedule();
  }

  trimISOString(iso: string) {
    if (!iso.endsWith('Z')) return iso;
    return iso.substring(0, (iso.length - 1));
  }

}
