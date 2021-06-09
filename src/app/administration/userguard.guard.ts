import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanLoad, Router, Route, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class UserguardGuard implements  CanLoad {

  constructor(private router: Router, private authSerive: AuthenticationService) { }

  canLoad(route: Route, segments: UrlSegment[]) {
      if (!this.authSerive.getLogin()) {
          this.router.navigate(['/login']);
          return false;
      }
      return true;
  }

}
