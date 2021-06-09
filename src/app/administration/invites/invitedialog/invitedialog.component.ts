import { Component, OnInit } from '@angular/core';
import { LinkdialogComponent } from '../linkdialog/linkdialog.component';
import { InviteService } from 'src/app/services/invite.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-invitedialog',
  templateUrl: './invitedialog.component.html',
  styleUrls: ['./invitedialog.component.scss'],
})
export class InvitedialogComponent implements OnInit {

  email = '';
  name = '';

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<InvitedialogComponent>,
              private inviteService: InviteService) {}

  ngOnInit() {}

  public cancel() {
    this.dialogRef.close({ new: false, data: null });
  }

  public submit() {
    this.inviteService.postInvite(this.email).then(
      doc => {
        const dialogRef = this.dialog.open(LinkdialogComponent, {
          width: '650px',
          data: doc
        });
        this.dialogRef.close({ new: false, data: null });
      });
  }
}
