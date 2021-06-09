import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as HttpStatusCode from 'http-status-codes';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class InviteService {
  constructor(private http: HttpClient, private router: Router) {}

  postInvite(email: string): Promise<IInvite> {
    return this.http.post<any>('/_api/invites', {email: email}).toPromise();
  }

  getInvites(): Promise<Array<IInvite>> {
    return this.http.get<any>('/_api/invites').toPromise();
  }

  private convertAndHandleError = <T>(input: Observable<T>): Promise<T> => {
    const promise = input.toPromise();
    promise.catch((err) => {
      if (err.status === HttpStatusCode.UNAUTHORIZED) {
        this.router.navigate(['/login']);
      }
    });
    return promise;
  }
}

export interface IInvite {
  _id: string;
  email: string;
  token: string;
  date: Date;
  creator: { _id: string; email: string };
}
