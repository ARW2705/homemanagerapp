import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpdateRecipePage } from './update-recipe';

@NgModule({
  declarations: [
    UpdateRecipePage,
  ],
  imports: [
    IonicPageModule.forChild(UpdateRecipePage),
  ],
})
export class UpdateRecipePageModule {}
