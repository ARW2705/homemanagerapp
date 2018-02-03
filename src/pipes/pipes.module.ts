import { NgModule } from '@angular/core';
import { ConvertTimePipe } from './convert-time/convert-time';
@NgModule({
	declarations: [ConvertTimePipe],
	imports: [],
	exports: [ConvertTimePipe]
})
export class PipesModule {}
