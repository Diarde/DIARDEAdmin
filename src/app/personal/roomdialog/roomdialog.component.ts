import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-roomdialog',
  templateUrl: './roomdialog.component.html',
  styleUrls: ['./roomdialog.component.scss']
})
export class RoomdialogComponent implements OnInit {

  name = '';
  description = '';

  constructor(public dialogRef: MatDialogRef<RoomdialogComponent>) { }

  ngOnInit() {
  }

  public cancel() {
    this.dialogRef.close({ new: false, data: null });
  }

  public new() {
    this.dialogRef.close({ new: true, data: { name: String(this.name), description: String(this.description) } });
  }

}
