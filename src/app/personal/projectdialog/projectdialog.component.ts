import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-projectdialog',
  templateUrl: './projectdialog.component.html',
  styleUrls: ['./projectdialog.component.scss']
})
export class ProjectdialogComponent implements OnInit {

  name = '';
  description = '';

  constructor(public dialogRef: MatDialogRef<ProjectdialogComponent>, private projectService: ProjectService, private router: Router) { }

  ngOnInit() {
  }

  public cancel() {
    this.dialogRef.close();
  }

  public new() {
    this.projectService.createProject(String(this.name), String(this.description)).then(result => {
      const id = result._id;
      this.router.navigate(['/home/personal/project', id]);
    });
    this.dialogRef.close();
  }

}
