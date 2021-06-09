import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {

  loading = false;
  submitted = false;
  isWrong = false;
  errorMessage = '';

  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayMessage = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {}

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    this.authenticationService
      .signup(this.email, this.password, this.confirmPassword)
      .then((data) => {
        if (data.success) {
          this.displayMessage = true;
        } else {
          this.errorMessage = data.error;
          this.isWrong = true;
          this.loading = false;
        }
      });
  }

  continue() {
    this.router.navigate(['/login']);
  }
}
