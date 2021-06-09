import { CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class UserGuard implements CanLoad {

    constructor(private router: Router, private authSerive: AuthenticationService) { }

    canLoad(route: Route, segments: UrlSegment[]) {
        if (!this.authSerive.getLogin()) {
            this.router.navigate(['/login']);
            return false;
        }
        return true;
    }

}
