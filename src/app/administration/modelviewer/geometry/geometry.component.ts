import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModelviewerService } from '../modelviewer.service';
import { Option, some, none, map, fold } from "fp-ts/lib/Option";
import { IGeometry, GeometryService } from 'src/app/services/geometry.service';

@Component({
  selector: 'app-geometry',
  templateUrl: './geometry.component.html',
  styleUrls: ['./geometry.component.scss']
})
export class GeometryComponent implements OnInit, OnDestroy {

  private subscription: Option<Subscription> = none;

  selected: IGeometry;
  geometries: IGeometry[];
  constructor(private modelService: ModelviewerService, 
              private geometryService : GeometryService) { }

  ngOnInit() {

    this.subscription = some(this.modelService.roomIDSubject.subscribe(message => {
      fold(
        () => { this.geometries = []}, 
        (ids: {projectID: string, roomID: string}) => { 
          this.geometryService.getGeometries(ids.projectID, ids.roomID).then(result => {
          this.geometries = result;
          })
        })(message);
    }));

  }

  ngOnDestroy(){
    map((subscription: Subscription) => {subscription.unsubscribe(); })(this.subscription);
  }

  select(row: IGeometry) {
    this.selected = row;
    this.modelService.GeometryID = row._id;
  }

}

