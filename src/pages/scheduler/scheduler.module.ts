import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SchedulerPage } from './scheduler';

@NgModule({
  declarations: [
    SchedulerPage,
  ],
  imports: [
    IonicPageModule.forChild(SchedulerPage),
  ],
})
export class SchedulerPageModule {}
