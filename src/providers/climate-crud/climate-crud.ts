import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionSheetController, ModalController } from 'ionic-angular';

import { ClimateProvider } from '../climate/climate';
import { CreateProgramPage } from '../../pages/program-crud-operations/create-program/create-program';
import { SelectProgramPage } from '../../pages/program-crud-operations/select-program/select-program';
import { UpdateProgramPage } from '../../pages/program-crud-operations/update-program/update-program';

@Injectable()
export class ClimateCrudProvider {

  desiredTemperature: number;

  constructor(private climateservice: ClimateProvider,
    private actionsheetCtrl: ActionSheetController,
    public modalCtrl: ModalController) {
    console.log('Hello ClimateCrudProvider Provider');
  }

  openClimateProgramActionSheet() {
    console.log("Open Action Sheet");
    const actionSheet = this.actionsheetCtrl.create({
      title: 'Select an Option',
      buttons: [
        {
          text: 'Select Program',
          handler: () => {
            console.log("Select Program");
            // start selection modal
            const modal = this.modalCtrl.create(SelectProgramPage);
            modal.onDidDismiss(data => {
              if (data) {
                console.log(data.id);
                this.climateservice.selectPreProgrammed(data.id);
              }
            });
            modal.present();
          }
        },
        {
          text: 'Create a New Program',
          handler: () => {
            console.log("Create a New Program");
            // start creation modal
            const modal = this.modalCtrl.create(CreateProgramPage);
            modal.onDidDismiss(data => {
              if (data) {
                console.log("Valid", data);
              }
            });
            modal.present();
          }
        },
        {
          text: 'Update Existing Program',
          handler: () => {
            console.log("Update Existing Program");
            // start update modal
            const modal = this.modalCtrl.create(UpdateProgramPage);
            modal.onDidDismiss(data => {
              if (data) {
                console.log(data);
              }
            });
            modal.present();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log("Action sheet cancelled");
          }
        }
      ]
    });
    actionSheet.present();
  }

}
