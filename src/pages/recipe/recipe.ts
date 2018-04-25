import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { BrewIoProvider } from '../../providers/brew-io/brew-io';

@IonicPage()
@Component({
  selector: 'page-recipe',
  templateUrl: 'recipe.html',
})
export class RecipePage implements OnInit {

  recipes: Array<any>;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private brewservice: BrewIoProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RecipePage');
  }

  ngOnInit() {
    this.brewservice.getAllBrewRoots()
      .subscribe(roots => {
        this.recipes = roots.map(root => {
          root.recipe.name = root.name;
          root.recipe.isExpanded = false;
          return root.recipe;
        });
      });
  }

  navigateToCreateRecipe(event) {

  }

  openFilterRecipePopover() {

  }

  openSortRecipePopover() {

  }

  expandRecipe(recipe: any) {
    this.recipes.forEach(recipe => recipe.isExpanded = false);
    recipe.isExpanded = true;
  }

}
