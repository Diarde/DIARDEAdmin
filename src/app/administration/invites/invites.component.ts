import { Component, OnInit } from '@angular/core';
import { InviteService, IInvite } from 'src/app/services/invite.service';
import { formatDate } from '@angular/common';
import { InvitedialogComponent } from './invitedialog/invitedialog.component';
import { LinkdialogComponent } from './linkdialog/linkdialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-invites',
  templateUrl: './invites.component.html',
  styleUrls: ['./invites.component.scss'],
})
export class InvitesComponent implements OnInit {
  invitesList = [];
  displayedColumns: string[] = ['email', 'token', 'date', 'issuer'];
  constructor(public dialog: MatDialog, private inviteService: InviteService) {
    this.loadInvites();
  }

  ngOnInit() {}

  addInvite() {
    const dialogRef = this.dialog.open(InvitedialogComponent, {
      width: '650px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.loadInvites();
    });
  }

  openLinkDialog(row: IInvite) {
    const dialogRef = this.dialog.open(LinkdialogComponent, {
      width: '650px',
      data: row
    });
  }

  private loadInvites() {
    this.inviteService.getInvites().then((invites) => {
      this.invitesList = invites.map((invite) => {
        return {
          email: invite.email,
          token: invite.token,
          date: formatDate(invite.date, 'mediumDate', 'en-Us'),
          issuer: invite.creator.email,
        };
      });
    });
  }

}
