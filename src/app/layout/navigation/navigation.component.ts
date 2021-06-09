import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  hasAdminRights = false;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.authenticationService.isAdmin().then(response => {
      this.hasAdminRights = response.admin;
    });
  }

  Projects() {
    this.router.navigate(['/home/personal/projects']);
  }

  Users() {
    this.router.navigate(['/home/administration/users']);
  }

  Invites() {
    this.router.navigate(['/home/administration/invites']);
  }

  Viewer() {
    this.router.navigate(['/home/administration/modelviewer']);
  }

  Profile() {}
}
