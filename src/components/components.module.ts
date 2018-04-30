import { NgModule } from '@angular/core';
import { ProgressBarComponent } from './progress-bar/progress-bar';
import { LoginNameComponent } from './login-name/login-name';
@NgModule({
	declarations: [ProgressBarComponent,
    LoginNameComponent],
	imports: [],
	exports: [ProgressBarComponent,
    LoginNameComponent]
})
export class ComponentsModule {}
