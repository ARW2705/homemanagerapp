import { Recipe } from './recipe';

export interface Batch {
  _id: string;
  notes: string;
  rating: number;
  masterRecipe: Recipe;
  status: string;
  favorite: boolean;
}
