import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { InvitesComponent } from './invites/invites.component';
import { ModelviewerComponent } from './modelviewer/modelviewer.component';

const routes: Routes = [
  {
    path: 'users',
    component: UsersComponent
  },
  {
    path: 'invites',
    component: InvitesComponent
  },
  {
    path: 'modelviewer',
    component: ModelviewerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
