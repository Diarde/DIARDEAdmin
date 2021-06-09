import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IRoom, IRoomAbridged } from './room.service';
import { Router } from '@angular/router';
import { PersonalModule } from '../personal/personal.module';
import { Observable } from 'rxjs';
import * as HttpStatusCode from 'http-status-codes';

@Injectable({
  providedIn: PersonalModule
})
export class ProjectService {

  constructor(private http: HttpClient, private router: Router) { }

  createProject(name: string, description: string): Promise<IProject> {
    return this.convertAndHandleError(this.http.post<IProject>('/_api/createproject', { name: name, description: description }));
  }

  // @Deprectated
  getProjectList(): Promise<IProject[]> {
    return this.convertAndHandleError(this.http.get<IProject[]>('/_api/projectlist'));
  }

  getProjects(): Promise<IProject[]> {
    return this.convertAndHandleError(this.http.get<IProject[]>('/_api/projects'));
  }

  getProject(id: string): Promise<IProject> {
    return this.convertAndHandleError(this.http.get<IProject>(`/_api/projects/${id}`));
  }

  updateName(id: string, name: string): Promise<IProject> {
    return this.convertAndHandleError(this.http.post<IProject>('/_api/updateprojectname', { id: id, name: name }));
  }

  updateDescription(id: string, description: string): Promise<IProject> {
    return this.convertAndHandleError(this.http.post<IProject>('/_api/updateprojectdesc', { id: id, description: description }));
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

export interface IProject {

  _id: string;
  name: string;
  description: string;
  date: Date;
  rooms: [IRoom | IRoomAbridged];

}

export interface NameDate {

  _id: string;
  name: string;
  date: Date;

}
