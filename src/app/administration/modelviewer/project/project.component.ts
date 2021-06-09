import { Component, OnInit } from "@angular/core";
import { Option, some, none, map } from "fp-ts/lib/Option";
import * as Fuse from "fuse.js";
import { ProjectService } from "src/app/services/project.service";
import { ModelviewerService } from '../modelviewer.service';

@Component({
  selector: "app-project",
  templateUrl: "./project.component.html",
  styleUrls: ["./project.component.scss"],
})
export class ProjectComponent implements OnInit {
  searchString = "";
  selected = null;
  dataSource = [];
  projects = [];
  fuse: Option<Fuse<any, any>> = none;

  constructor(
    private projectService: ProjectService, 
    private viewService: ModelviewerService) {
    
    this.projectService.getProjects().then((projects) => {
      projects.forEach((project) => {
        this.projects.push({
          id: project._id,
          name: project.name,
          local: false,
        });
      });
      this.dataSource = this.projects;

      const options = {
        keys: ["name", "date"],
      };
      this.fuse = some(new Fuse(this.projects, options));
    });
  }

  ngOnInit() {}

  select(row) {
    this.selected = row;
    this.viewService.ProjectID = row.id;
  }

  keypress() {
    map((fuse) => {
      this.dataSource = this.searchString
        ? (fuse as any).search(this.searchString)
        : this.projects;
    })(this.fuse);
  }
}
