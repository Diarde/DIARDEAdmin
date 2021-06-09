import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.scss'],
})
export class PasswordresetComponent implements OnInit {
  isWrong = false;
  errorMessage = '';

  password = '';
  confirm = '';
  token = '';

  tokenValid = true;

  constructor(
    private router: Router,
    route: ActivatedRoute,
    private authenticationService: AuthenticationService
  ) {
    route.params.subscribe((params) => {
      authenticationService.isTokenValid(params.token).then((result) => {
        this.token = params.token;
        this.tokenValid = result.result;
      });
    });
  }

  ngOnInit() {}

  onSubmit() {
    this.authenticationService
      .passwordreset(this.token, this.password, this.confirm)
      .then((response) => {
        if (response.success) {
          this.router.navigate(['/home']);
        } else {
          this.isWrong = true;
          this.errorMessage = response.error;
        }
      });
  }

  continue() {
    this.router.navigate(['/login']);
  }
}
