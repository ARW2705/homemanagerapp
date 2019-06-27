import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';
import { TooltipsModule } from 'ionic-tooltips';
import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ClimatecontrolPage } from '../pages/climatecontrol/climatecontrol';
import { GaragedoorPage } from '../pages/garagedoor/garagedoor';
import { LoginPage } from '../pages/login/login';
import { CreateProgramPage } from '../pages/program-crud-operations/create-program/create-program';
import { SelectProgramPage } from '../pages/program-crud-operations/select-program/select-program';
import { UpdateProgramPage } from '../pages/program-crud-operations/update-program/update-program';
import { SchedulerPage } from '../pages/scheduler/scheduler';
import { LandingPage } from '../pages/landing/landing';
import { SecCamPage } from '../pages/sec-cam/sec-cam';
import { VideoQueryFormPage } from '../pages/video-query-form/video-query-form';
import { VideoOptionsPopoverPage } from '../pages/video-options-popover/video-options-popover';
import { ZoneNamePage } from '../pages/zone-name/zone-name';

import { ProgressBarComponent } from '../components/progress-bar/progress-bar';
import { LoginNameComponent } from '../components/login-name/login-name';

import { ClimateProvider } from '../providers/climate/climate';
import { ProcessHttpmsgProvider } from '../providers/process-httpmsg/process-httpmsg';

import { baseURL } from '../shared/baseurl';
import { minTemperature, maxTemperature } from '../shared/temperatureconst';
import { AuthenticationProvider } from '../providers/authentication/authentication';
import { AuthorizedInterceptor, UnauthorizedInterceptor } from '../providers/interceptor/interceptor';
import { GarageDoorProvider } from '../providers/garage-door/garage-door';
import { WebsocketConnectionProvider } from '../providers/websocket-connection/websocket-connection';
import { LocalNodeProvider } from '../providers/local-node/local-node';
import { SecCamProvider } from '../providers/sec-cam/sec-cam';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ClimatecontrolPage,
    GaragedoorPage,
    LoginPage,
    CreateProgramPage,
    SelectProgramPage,
    UpdateProgramPage,
    SchedulerPage,
    LandingPage,
    LoginNameComponent,
    ProgressBarComponent,
    SecCamPage,
    VideoQueryFormPage,
    VideoOptionsPopoverPage,
    ZoneNamePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    IonicStorageModule.forRoot(),
    TooltipsModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ClimatecontrolPage,
    GaragedoorPage,
    LoginPage,
    CreateProgramPage,
    SelectProgramPage,
    UpdateProgramPage,
    SchedulerPage,
    LandingPage,
    SecCamPage,
    VideoQueryFormPage,
    VideoOptionsPopoverPage,
    ZoneNamePage
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
    LocalNodeProvider,
    SecCamProvider
  ]
})
export class AppModule {}
