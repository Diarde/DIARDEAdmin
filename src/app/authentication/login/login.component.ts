import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../../services/authentication.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loading = false;
  submitted = false;
  returnUrl = '/';
  isWrong = false;
  errorMessage = '';

  email: string;
  password: string;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {}

  onSubmit() {
    this.submitted = true;

    this.loading = true;
    this.authenticationService
      .login(this.email, this.password)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data.authentication === 'success') {
            this.router.navigate([this.returnUrl]);
          } else {
            this.errorMessage = data.error;
            this.isWrong = true;
            this.loading = false;
          }
        },
        (error) => {
          this.isWrong = true;
          this.loading = false;
        }
      );
  }

  onSignup() {
    this.authenticationService.clearLogin();
    this.router.navigate(['/signup']);
  }

  pwrequest() {
    this.router.navigate(['/passwordrequest']);
  }
}
