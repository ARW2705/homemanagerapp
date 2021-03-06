import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { WebsocketConnectionProvider } from '../../providers/websocket-connection/websocket-connection';
import { User } from '../../shared/user';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  loginForm: FormGroup;
  user: User = {_id: '', username: '', password: '', remember: false};
  errMsg: string;
  showPassword: boolean = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private authService: AuthenticationProvider,
    private wssConnection: WebsocketConnectionProvider,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    private formBuilder: FormBuilder) {
      this.loginForm = this.formBuilder.group({
        // TODO avoid warning if password manager fills in form
        username: ['', Validators.required],
        password: ['', Validators.required],
        remember: false
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  togglePasswordVisible() {
    this.showPassword = (this.showPassword) ? false: true;
  }

  onSubmit() {
    this.user.username = this.loginForm.get('username').value;
    this.user.password = this.loginForm.get('password').value;
    this.user.remember = this.loginForm.get('remember').value;
    this.authService.logIn(this.user)
      .subscribe(res => {
        if (res.success) {
          this.wssConnection.connectSocket()
            .subscribe(socket => {
              console.log("Logged In", res);
              this.viewCtrl.dismiss(res.success);
            });
        } else {
          console.log(res);
        }
      },
      err => { console.log(err); this.errMsg = err; }
    );
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
