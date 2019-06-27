import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AuthenticationProvider } from '../providers/authentication/authentication';
import { WebsocketConnectionProvider } from '../providers/websocket-connection/websocket-connection';

import { ClimatecontrolPage } from '../pages/climatecontrol/climatecontrol';
import { GaragedoorPage } from '../pages/garagedoor/garagedoor';
import { HomePage } from '../pages/home/home';
import { LandingPage } from '../pages/landing/landing';
import { LoginPage } from '../pages/login/login';
import { SecCamPage } from '../pages/sec-cam/sec-cam';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = LandingPage;
  authChecked: boolean = false;
  loggedIn: boolean = false;
  pages: Array<{title: string, component: any, icon: string}>;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public modalCtrl: ModalController,
    public authService: AuthenticationProvider,
    public wssConnection: WebsocketConnectionProvider,
    public events: Events) {

    this.initializeApp();

    // load user credentials from storage if 'remember' was set to true on login
    authService.loadUserCredentials();
    // user authenticated from token
    events.subscribe('user:authed', () => {
      wssConnection.connectSocket()
        .subscribe(socket => {
          this.loggedIn = this.authService.isLoggedIn();
          this.authChecked = true;
          this.openPage(this.pages[0]);
        });
    });
    // no or invalid token, user not authenticated
    events.subscribe('user:not-authed', () => {
      this.loggedIn = this.authService.isLoggedIn();
      this.authChecked = true;
      this.openLogin();
    });
    // user is logged in
    events.subscribe('user:loggedin', () => {
      this.loggedIn = this.authService.isLoggedIn();
      this.authChecked = true;
    });

    // navigation pages
    this.pages = [
      { title: 'At A Glance', component: HomePage , icon: 'home'},
      { title: 'Climate Control', component: ClimatecontrolPage, icon: 'thermometer'},
      { title: 'Security Cam', component: SecCamPage, icon: 'videocam'}
      // future updates
      // { title: 'Garage Door', component: GaragedoorPage, icon: 'car'},
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }

  // login modal
  openLogin() {
    const modal = this.modalCtrl.create(LoginPage);
    modal.onDidDismiss(data => {
      this.openPage(this.pages[0]);
      if (data !== undefined) {
        this.loggedIn = this.authService.isLoggedIn();
      } else {
        this.rootPage = HomePage;
      }
    });
    modal.present();
  }

  // logout and close socket connection
  logOut() {
    this.wssConnection.disconnectSocket();
    this.loggedIn = false;
    this.authService.logOut();
    this.openLogin();
  }
}
