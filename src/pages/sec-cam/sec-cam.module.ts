import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SecCamPage } from './sec-cam';

@NgModule({
  declarations: [
    SecCamPage,
  ],
  imports: [
    IonicPageModule.forChild(SecCamPage),
  ],
})
export class SecCamPageModule {}
