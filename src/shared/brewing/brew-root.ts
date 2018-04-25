import { Recipe } from './recipe';
import { Batch } from './batches';
import { Style } from './styles';

export interface BrewRoot {
  _id: string;
  name: string;
  efficiency: number;
  style: Style;
  recipe: Recipe;
  batches: Array<Batch>;
}
