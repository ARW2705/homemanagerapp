import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import { AuthenticationProvider } from '../providers/authentication/authentication';

import { HomePage } from '../pages/home/home';
import { ClimatecontrolPage } from '../pages/climatecontrol/climatecontrol';
import { GaragedoorPage } from '../pages/garagedoor/garagedoor';
import { BrewingPage } from '../pages/brewing/brewing';
import { LoginPage } from '../pages/login/login';
import { LandingPage } from '../pages/landing/landing';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LandingPage;
  loggedIn: boolean = false;
  authChecked: boolean = false;

  pages: Array<{title: string, component: any, icon: string}>;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public modalCtrl: ModalController,
    private authService: AuthenticationProvider,
    private storage: Storage,
    public events: Events) {

    this.initializeApp();

    // load user credentials from storage if 'remember' was set to true on login
    authService.loadUserCredentials();
    events.subscribe('user:authed', () => {
      console.log("Authed from stored token");
      this.loggedIn = this.authService.isLoggedIn();
      this.authChecked = true;
      this.openPage(this.pages[0]);
    });
    events.subscribe('user:not-authed', () => {
      console.log("Not-Authed from stored token");
      this.loggedIn = this.authService.isLoggedIn();
      this.authChecked = true;
      this.openLogin();
    });
    events.subscribe('user:loggedin', () => {
      console.log("Log In Successful");
      this.loggedIn = this.authService.isLoggedIn();
      this.authChecked = true;
    })

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'At A Glance', component: HomePage , icon: 'home'},
      { title: 'Climate Control', component: ClimatecontrolPage, icon: 'thermometer'},
      { title: 'Garage Door', component: GaragedoorPage, icon: 'car'},
      { title: 'Brew I/O', component: BrewingPage, icon: 'beer'}
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  openLogin() {
    const modal = this.modalCtrl.create(LoginPage);
    modal.onDidDismiss(data => {
      this.openPage(this.pages[0]);
      if (data !== undefined) {
        this.loggedIn = this.authService.isLoggedIn();
      }
    });
    modal.present();
  }

  logOut() {
    this.loggedIn = false;
    this.authService.logOut();
    this.openLogin();
  }
}
