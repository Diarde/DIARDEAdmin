import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-passwordrequest',
  templateUrl: './passwordrequest.component.html',
  styleUrls: ['./passwordrequest.component.scss'],
})
export class PasswordrequestComponent implements OnInit {
  displayMessage = false;
  message = '';
  email = '';
  isWrong = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {}

  onSubmit() {
    this.authenticationService
      .passwordresetrequest(this.email)
      .then((response) => {
        if (response.success) {
          this.isWrong = false;
          this.message =
            'A verification email has been sent. Use the link in the email to reset your password.';
          this.displayMessage = true;
        }
        this.errorMessage = response.error;
        this.isWrong = true;
      });
  }

  continue() {
    this.router.navigate(['/login']);
  }

  cancel() {
    this.router.navigate(['/login']);
  }
}
