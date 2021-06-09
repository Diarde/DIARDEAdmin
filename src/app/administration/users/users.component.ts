import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  userList = [];
  displayedColumns: string[] = ['email', 'verified', 'isadmin'];

  constructor(private authenticationService: AuthenticationService) {
    this.authenticationService.getUsers().then(userList => {
      this.userList = userList;
    });
  }

  ngOnInit() {}
}
