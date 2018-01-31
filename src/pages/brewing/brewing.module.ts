import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BrewingPage } from './brewing';

@NgModule({
  declarations: [
    BrewingPage,
  ],
  imports: [
    IonicPageModule.forChild(BrewingPage),
  ],
})
export class BrewingPageModule {}
