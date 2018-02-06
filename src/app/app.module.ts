import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ClimatecontrolPage } from '../pages/climatecontrol/climatecontrol';
import { GaragedoorPage } from '../pages/garagedoor/garagedoor';
import { BrewingPage } from '../pages/brewing/brewing';
import { LoginPage } from '../pages/login/login';
import { CreateProgramPage } from '../pages/program-crud-operations/create-program/create-program';
import { SelectProgramPage } from '../pages/program-crud-operations/select-program/select-program';
import { UpdateProgramPage } from '../pages/program-crud-operations/update-program/update-program';
import { SchedulerPage } from '../pages/scheduler/scheduler';

import { ClimateProvider } from '../providers/climate/climate';
import { ProcessHttpmsgProvider } from '../providers/process-httpmsg/process-httpmsg';

import { baseURL } from '../shared/baseurl';
import { minTemperature, maxTemperature } from '../shared/temperatureconst';
import { ClimateCrudProvider } from '../providers/climate-crud/climate-crud';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ClimatecontrolPage,
    GaragedoorPage,
    BrewingPage,
    LoginPage,
    CreateProgramPage,
    SelectProgramPage,
    UpdateProgramPage,
    SchedulerPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ClimatecontrolPage,
    GaragedoorPage,
    BrewingPage,
    LoginPage,
    CreateProgramPage,
    SelectProgramPage,
    UpdateProgramPage,
    SchedulerPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: 'baseURL', useValue: baseURL},
    {provide: 'minTemperature', useValue: minTemperature},
    {provide: 'maxTemperature', useValue: maxTemperature},
    ClimateProvider,
    ProcessHttpmsgProvider,
    ClimateCrudProvider
  ]
})
export class AppModule {}
