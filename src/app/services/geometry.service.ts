import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as HttpStatusCode from 'http-status-codes';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeometryService {

  constructor(private http: HttpClient, private router: Router) { }

  getGeometries(projectID: string, roomID: string): Promise<Array<IGeometry>>{
    return this.convertAndHandleError(this.http.get<IGeometry[]>(`/_api/projects/${projectID}/rooms/${roomID}/geometries`));
  }

  getRevisions(projectID: string, roomID: string, geometryID: string): Promise<Array<IRevision>>{
    return this.convertAndHandleError(this.http.get<IRevision[]>(`/_api/projects/${projectID}/rooms/${roomID}/geometries/${geometryID}/revisions`));
  }

  loadModel(id: string): Promise<IModel> {
    return this.convertAndHandleError<IModel>(this.http.post<IModel>('/_api/loadmodel', { id }));
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

export interface IRevision {

  id: string;
  date: Date;
  model: string;

}

export interface IGeometry {

  _id: string;
  name: string;
  date: Date;
  revisions: Array<any>;

}

export interface IModel {

  _id: string;
  date: Date;
  data: {
    cameras: Array<any>,
    model: {
    ground: Array<string>,
    vertices: Array<IVertex>,
    faces: Array<IFace>
  }};


}

export interface IPoint {
  x: number;
  y: number;
  z: number;
}

export interface IVertex {
  id: string;
  point: IPoint;
}

export interface IFace {
  id: string;
  vertices: Array<string>;
  doors: Array<Array<string>>;
  windows: Array<Array<string>>;
}