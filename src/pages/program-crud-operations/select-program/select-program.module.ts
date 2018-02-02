import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectProgramPage } from './select-program';

@NgModule({
  declarations: [
    SelectProgramPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectProgramPage),
  ],
})
export class SelectProgramPageModule {}
