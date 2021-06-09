import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PersonalRoutingModule } from './personal-routing.module';
import { ProjectsComponent } from './projects/projects.component';
import { RoomComponent } from './room/room.component';
import { RoomdialogComponent } from './roomdialog/roomdialog.component';
import { ProjectComponent } from './project/project.component';
import { ProjectdialogComponent } from './projectdialog/projectdialog.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CustomMaterialModule } from '../material/material.module';
import { ProjectService } from '../services/project.service';
import { HttpClientModule } from '@angular/common/http';
import { ImagedialogComponent } from './room/imagedialog/imagedialog.component';

@NgModule({
  declarations: [
    ProjectsComponent,
    RoomComponent,
    RoomdialogComponent,
    ProjectComponent,
    ProjectdialogComponent,
    ImagedialogComponent,
    ImagedialogComponent
  ],
  imports: [
    CommonModule,
    PersonalRoutingModule,
    FormsModule,
    CustomMaterialModule,
    HttpClientModule
  ],
  providers: [ProjectService],
  entryComponents: [
    ProjectdialogComponent,
    RoomdialogComponent,
    ImagedialogComponent
  ]
})
export class PersonalModule {}
