import { Component, OnInit, Input, Output } from '@angular/core';
import { NavController, NavParams, ModalController, ActionSheetController } from 'ionic-angular';

import { BrewRoot } from '../../shared/brewing/brew-root';
import { Batch } from '../../shared/brewing/batches';

import { BrewIoProvider } from '../../providers/brew-io/brew-io';

@Component({
  selector: 'page-brewing',
  templateUrl: 'brewing.html',
})
export class BrewingPage implements OnInit {

  brews: Array<BrewRoot>;
  activeBatches: Array<Batch>;
  errMsg: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private brewservice: BrewIoProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BrewingPage');
  }

  ngOnInit() {
    this.brewservice.getAllBrewRoots()
      .subscribe(brews => {
        this.brews = brews;
        brews.forEach(root => {
          root.batches.forEach(batch => {
            if (batch.status) this.activeBatches.push(batch);
          });
        });
      },
        err => this.errMsg = err
      );
  }

  navigateToRecipes(event) {
    // this.navCtrl.push(RecipePage);
  }

  navigateToHistory(event) {

  }

  startNewBatch(event) {

  }

  getBatchProgress(id: string) {
    return 50;
  }

  getProcessEndDateTime(id: string) {

  }

}
