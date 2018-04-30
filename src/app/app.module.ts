import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';
import { TooltipsModule } from 'ionic-tooltips';

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
import { LandingPage } from '../pages/landing/landing';
import { RecipePage } from '../pages/recipe/recipe';
import { CreateRecipePage } from '../pages/recipe-crud-operations/create-recipe/create-recipe';
import { UpdateRecipePage } from '../pages/recipe-crud-operations/update-recipe/update-recipe';
import { BatchPage } from '../pages/batch/batch';

import { ProgressBarComponent } from '../components/progress-bar/progress-bar';

import { ClimateProvider } from '../providers/climate/climate';
import { ProcessHttpmsgProvider } from '../providers/process-httpmsg/process-httpmsg';

import { baseURL } from '../shared/baseurl';
import { minTemperature, maxTemperature } from '../shared/temperatureconst';
import { AuthenticationProvider } from '../providers/authentication/authentication';
import { AuthorizedInterceptor, UnauthorizedInterceptor } from '../providers/interceptor/interceptor';
import { GarageDoorProvider } from '../providers/garage-door/garage-door';
import { WebsocketConnectionProvider } from '../providers/websocket-connection/websocket-connection';
import { BrewIoProvider } from '../providers/brew-io/brew-io';

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
    SchedulerPage,
    LandingPage,
    RecipePage,
    BatchPage,
    CreateRecipePage,
    UpdateRecipePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    IonicStorageModule.forRoot(),
    TooltipsModule
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
    SchedulerPage,
    LandingPage,
    RecipePage,
    BatchPage,
    CreateRecipePage,
    UpdateRecipePage
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
    AuthenticationProvider,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthorizedInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthorizedInterceptor,
      multi: true
    },
    GarageDoorProvider,
    WebsocketConnectionProvider,
    BrewIoProvider
  ]
})
export class AppModule {}
