import { Component } from '@angular/core';

import { AuthenticationProvider } from '../../providers/authentication/authentication';

@Component({
  selector: 'login-name',
  templateUrl: 'login-name.html'
})
export class LoginNameComponent {

  user: string;

  constructor(private authService: AuthenticationProvider) {
    console.log('Hello LoginNameComponent Component');
    this.user = this.authService.getPublicUsername();
    console.log('got user', this.user);
  }

}
