import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModelviewerService } from '../modelviewer.service';
import { Option, some, none, map, fold } from "fp-ts/lib/Option";
import { GeometryService, IModel } from 'src/app/services/geometry.service';

@Component({
  selector: 'app-revision',
  templateUrl: './revision.component.html',
  styleUrls: ['./revision.component.scss']
})
export class RevisionComponent implements OnInit, OnDestroy {

  revisions = [];
  private subscription: Option<Subscription> = none;

  constructor(private modelService: ModelviewerService,
              private geometryService : GeometryService) { }

  ngOnInit() {

    this.subscription = some(this.modelService.geometryIDSubject.subscribe(message => {
      fold(
        () => { 
          this.revisions = [];
        }, 
        (ids: {projectID: string, roomID: string, geometryID: string}) => { 
          this.geometryService.getRevisions(ids.projectID, ids.roomID, ids.geometryID).then(revisions => {
            this.revisions = revisions;
          });
          })(message);
    }));

  }

  ngOnDestroy(){
    map((subscription: Subscription) => {subscription.unsubscribe(); })(this.subscription);
  }

  open(modelID: string){
    this.geometryService.loadModel(modelID).then((model: IModel) => {
      this.modelService.Model = model;
    });
  }

}
