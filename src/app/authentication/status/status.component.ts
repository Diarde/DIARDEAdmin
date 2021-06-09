import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
})
export class StatusComponent implements OnInit {
  constructor(
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    route.params.subscribe((params) => {
      authenticationService.verifyemail(params.token).then((result) => {
        if (result.success) {
          router.navigate(['/home']);
        }
      });
    });
  }

  ngOnInit() {}

  continue() {
    this.router.navigate(['/login']);
  }
}
