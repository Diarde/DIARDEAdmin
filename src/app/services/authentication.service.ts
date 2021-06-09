import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams  } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  constructor(private http: HttpClient, private router: Router) {
  }

  login(email: string, password: string) {
    return this.http.post<any>('/_api/login', { email: email, password: password })
      .pipe(map(response => {
        if (response.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
        return response;
      }));
  }

  signup(email: string, password: string, confirmPassword: string): Promise<{success: boolean, error: null, result: any}> {
    const retPromise = this.http.post<any>('/_api/user/signup',
    { email: email, password: password, confirmPassword: confirmPassword }).toPromise();
    retPromise.then((response) => { if (response.result) {  localStorage.setItem('currentUser', JSON.stringify(response.result)); } });
    return retPromise;
  }

  passwordresetrequest(email: string): Promise<{success: string, error: string}> {
    const retPromise = this.http.post<any>('/_api/user/requestpasswordreset',
    { email: email }).toPromise();
    retPromise.catch(() => { /* Handled elsewhere */ });
    return retPromise;
  }

  passwordreset(token: string, password: string, confirm: string): Promise<{success: string, error: string, result: any}> {
    const retPromise = this.http.post<any>('/_api/user/resetpassword',
    { token: token, password: password, confirm: confirm }).toPromise();
    retPromise.then((response) => { if (response.result) {  localStorage.setItem('currentUser', JSON.stringify(response.result)); } });
    return retPromise;
  }

  verifyemail(token: string): Promise<{success: string, error: string}> {
    return this.http.post<any>('/_api/user/verifyemail', {token: token}).toPromise();
  }

  logout(): Promise<any> {
    const retPromise = this.http.get<any>('/_api/logout').toPromise();
    this.clearLogin();
    retPromise.catch(() => { /* Handled elsewhere */ });
    this.router.navigate(['/login']);
    return retPromise;
  }

  isTokenValid(token: string): Promise<{success: boolean, error: string, result: boolean}> {
    const params = (new HttpParams()).set('token', token);
    return this.http.get<any>(`/_api/user/istokenvalid/${token}`).toPromise();
  }

  isAdmin() {
    return this.http.post<{admin: boolean}>('/_api/isadmin', {}).toPromise();
  }

  getLogin() {
    return localStorage.getItem('currentUser');
  }

  clearLogin() {
    localStorage.removeItem('currentUser');
  }

  getUsers() {
    return this.http.get<any>('/_api/users').toPromise();
  }

}
