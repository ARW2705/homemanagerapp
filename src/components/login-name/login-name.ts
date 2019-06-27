import { Component } from '@angular/core';

import { AuthenticationProvider } from '../../providers/authentication/authentication';

@Component({
  selector: 'login-name',
  templateUrl: 'login-name.html'
})
export class LoginNameComponent {
  user: string;

  constructor(public authService: AuthenticationProvider) {
    this.user = this.authService.getPublicUsername();
  }

}
