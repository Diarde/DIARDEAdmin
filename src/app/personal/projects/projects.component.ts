import { Component, OnInit } from "@angular/core";
import { ProjectdialogComponent } from "../projectdialog/projectdialog.component";
import { ProjectService, IProject } from "../../services/project.service";
import { Router, ActivatedRoute } from "@angular/router";
import { formatDate } from "@angular/common";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import * as Fuse from "fuse.js";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
  animations: [
    trigger("detailExpand", [
      state(
        "collapsed",
        style({ height: "0px", minHeight: "0", display: "none" })
      ),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("0ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class ProjectsComponent implements OnInit {
  searchString = "";
  selected = null;
  displayedColumns: string[] = ["position", "name", "date"];
  projectList = [];
  projectMap = new Map();
  dataSource = [];
  expandedElement: any | null;
  fuse;

  constructor(
    public dialog: MatDialog,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    
    this.loadProjects();

    this.route.fragment.subscribe((projectID) => {
      
      this.loadProject(projectID);

      this.expandedElement = projectID;
      setTimeout(() =>{
        const element = document.getElementById(projectID);
        if(element){
        element.scrollIntoView();
      }}); 
    });
  }

  open(row: any, room: any) {
    const id = row.id;
    this.router.navigate(["/home/personal/projects", id, 'rooms', room._id], {
      fragment: room ? "room=" + room._id : "",
    });
  }

  select(row) {
    this.selected = row;
  }

  addProject(): void {
    const dialogRef = this.dialog.open(ProjectdialogComponent, {
      width: "650px",
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  keypress() {
    this.dataSource = this.searchString
      ? this.fuse.search(this.searchString)
      : this.projectList;
  }

  public setHash(projectID) {
    window.location.hash = projectID;
  }

  // tslint:disable-next-line:variable-name
  public expand(row_id: string) {
    return row_id === this.expandedElement ? "expanded" : "collapsed";
  }


  private loadProjects = () => {
    this.projectService.getProjects().then((data: IProject[]) => {
      data.forEach((iProject, index) => {

        const project = {
          id: iProject._id,
          position: index + 1,
          name: iProject.name,
          date: formatDate(iProject.date, "mediumDate", "en-Us"),
          rooms: null
        }

        this.projectList.push(project);
        this.projectMap.set(project.id, project);
      });
      this.dataSource = this.projectList;
      const options = {
        keys: ["name", "date"],
      };
      this.fuse = new Fuse(this.projectList, options);
    })
    .catch(() => {
      /* Error handled somewhere else*/
    });
  }

  private loadProject = (id:string) => {
    this.projectService.getProject(id).then((data: IProject) => {
      const proejct = this.projectMap.get(id);
      if(proejct){
        proejct.rooms = data.rooms;
      }
    }).catch(() => { /* Error handled somewhere else*/ });
  }

}
