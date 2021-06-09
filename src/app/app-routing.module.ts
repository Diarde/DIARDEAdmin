import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { SignupComponent } from './authentication/signup/signup.component';
import { NavigationComponent } from './layout/navigation/navigation.component';
import { UserGuard } from './personal/userguard';
import { PasswordrequestComponent } from './authentication/passwordrequest/passwordrequest.component';
import { PasswordresetComponent } from './authentication/passwordreset/passwordreset.component';
import { StatusComponent } from './authentication/status/status.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'passwordrequest', component: PasswordrequestComponent },
  { path: 'passwordreset/:token', component: PasswordresetComponent },
  { path: 'status/:token', component: StatusComponent },
  {
    path: 'home',
    component: NavigationComponent,
    children: [
      {
        path: 'personal',
        loadChildren: './personal/personal.module#PersonalModule',
        canLoad: [UserGuard],
      },
      {
        path: 'administration',
        loadChildren:
          './administration/administration.module#AdministrationModule',
        canLoad: [UserGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
