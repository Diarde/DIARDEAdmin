import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministrationRoutingModule } from './administration-routing.module';
import { UsersComponent } from './users/users.component';
import { CustomMaterialModule } from '../material/material.module';
import { InvitesComponent } from './invites/invites.component';
import { InvitedialogComponent } from './invites/invitedialog/invitedialog.component';
import { FormsModule } from '@angular/forms';
import { LinkdialogComponent } from './invites/linkdialog/linkdialog.component';
import { ModelviewerComponent } from './modelviewer/modelviewer.component';
import { ProjectComponent } from './modelviewer/project/project.component';
import { RoomComponent } from './modelviewer/room/room.component';
import { GeometryComponent } from './modelviewer/geometry/geometry.component';
import { RevisionComponent } from './modelviewer/revision/revision.component';
import { ImageComponent } from './modelviewer/image/image.component';
import { ProjectService } from '../services/project.service';

@NgModule({
  declarations: [UsersComponent, InvitesComponent, InvitedialogComponent, LinkdialogComponent,
    ModelviewerComponent, ProjectComponent, RoomComponent, GeometryComponent, RevisionComponent, ImageComponent],
  imports: [
    CommonModule,
    CustomMaterialModule,
    AdministrationRoutingModule,
    FormsModule
  ],  providers: [ProjectService],
  entryComponents: [
    InvitedialogComponent,  LinkdialogComponent
  ]
})
export class AdministrationModule { }
