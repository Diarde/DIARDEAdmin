import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { DialogData } from 'src/app/personal/room/imagedialog/imagedialog.component';
import { IInvite } from 'src/app/services/invite.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-linkdialog',
  templateUrl: './linkdialog.component.html',
  styleUrls: ['./linkdialog.component.scss'],
})
export class LinkdialogComponent implements OnInit {
  base = 'https://diarde.com';
  link = '';
  message = 'Copy to clipboard';
  show = false;

  @ViewChild('tooltip', { static: true }) tooltip: ElementRef;
  constructor(
    public dialogRef: MatDialogRef<LinkdialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IInvite
  ) {
    this.link = `${this.base}/?tk=${data.token}`;
  }

  ngOnInit() {}

  cancel() {
    this.dialogRef.close({ new: false, data: null });
  }

  copyToClipboard() {
    this.message = 'Copied to clipboard';
    const element = document.createElement('textarea');
    element.value = this.link;
    document.body.appendChild(element);
    element.select();
    document.execCommand('copy');
    element.remove();
  }

}
