import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService, IProject } from '../../services/project.service';
import { RoomService, IRoom } from '../../services/room.service';
import { ImageuploadService } from '../../services/imageupload.service';
import { RoomdialogComponent } from '../roomdialog/roomdialog.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { formatDate } from '@angular/common';
import * as Fuse from 'fuse.js';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'], animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('0ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})


export class ProjectComponent implements OnInit {

  private projectID = '';
  _editName = false;
  _editDescription = false;
  left = '0px';
  top = '0px';
  photoID = '';
  searchString = '';
  fuse;


  private persistName: (v: boolean) => void;
  private persistDescription: (v: boolean) => void;

  displayedColumns: string[] = ['name', 'date'];

  project: IProject;
  projectName = '';
  description = '';
  rooms: IRoom[] = [];

  expandedElement = '';

  constructor(private dialog: MatDialog, private route: ActivatedRoute, private projectService: ProjectService,
              private roomService: RoomService, private imageuploadService: ImageuploadService) { }

  ngOnInit() {
    console.log("new init");
    this.route.fragment.subscribe(fragment => {
      console.log("new fragment");
      this.projectID = fragment;
      this.projectService.getProject(fragment).then((data: IProject) => {
        this.populatePage(data, this.expandedElement);
      }).catch(() => { /* Error handled somewhere else*/ });
    });
  }

  public setHash(roomID) {
    window.location.hash = 'room=' + roomID;
  }

  public addRoom(): void {

    const dialogRef = this.dialog.open(RoomdialogComponent, {
      width: '650px',
    });

    dialogRef.afterClosed().subscribe((result: { new: boolean, data: { name: string, description: string } }) => {
      if (result.new) {
        this.roomService.createRoom(this.projectID, result.data.name, result.data.description).then(_result => {
          return this.projectService.getProject(this.projectID).then((data: IProject) => {
            this.populatePage(data, this.expandedElement);
          });
        }).catch(() => { /* Error handled somewhere else*/ });
      }
    });
  }

  public editName = (oldName: string) => {
    this._editName = true;
    this.persistName = (_do: boolean) => {
      this._editName = false;
      _do ? this.projectService.updateName(this.projectID, this.projectName).then(_data => {
        this.populatePage(_data, this.expandedElement);
      }).catch(() => { /* Error handled somewhere else*/ }) : this.projectName = oldName;
    };
  }

  public editDescription = (oldDescription: string) => {
    this._editDescription = true;
    this.persistDescription = (_do: boolean) => {
      this._editDescription = false;
      _do ? this.projectService.updateDescription(this.projectID, this.description).then(_data => {
        this.populatePage(_data, this.expandedElement);
      }).catch(() => { /* Error handled somewhere else*/ }) : this.description = oldDescription;
    };
  }

  public formatDatum(date: string): string {
    return formatDate(date, 'mediumDate', 'en-Us');
  }

  keypress() {
    this.rooms = this.searchString ? this.fuse.search(this.searchString) : this.project.rooms;
  }

  private populatePage(project: IProject, priority) {
    this.project = project;
    this.projectName = String(project.name);
    this.description = String(project.description);
    const options = {
      keys: ['name', 'date']
    };
    this.fuse = new Fuse(this.project.rooms, options);
    this.rooms = (project.rooms as IRoom[]).sort((a, b) => {
      return a._id === priority ? -1 : (b._id === priority ? 1 : 0);
    });
  }

  // tslint:disable-next-line:variable-name
  public expand(row_id: string) {
    return row_id === this.expandedElement ? 'expanded' : 'collapsed';
  }


}
