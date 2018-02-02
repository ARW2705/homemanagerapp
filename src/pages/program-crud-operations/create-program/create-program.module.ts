import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateProgramPage } from './create-program';

@NgModule({
  declarations: [
    CreateProgramPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateProgramPage),
  ],
})
export class CreateProgramPageModule {}
