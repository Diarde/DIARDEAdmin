import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IPhoto } from './imageupload.service';
import { Observable } from 'rxjs';
import * as HttpStatusCode from 'http-status-codes';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(private http: HttpClient, private router: Router) { }

  getRooms(projectID: string): Promise<Array<IRoom>>{
    return this.convertAndHandleError(this.http.get<IRoom[]>(`/_api/projects/${projectID}/rooms`));
  }

  getRoom(projectID: string, roomID: string): Promise<IRoom>{
    return this.convertAndHandleError(this.http.get<IRoom>(`/_api/projects/${projectID}/rooms/${roomID}`));
  }

  createRoom(projectId: string, name: string, description: string): Promise<IRoom> {
    return this.convertAndHandleError(this.http.post<IRoom>('/_api/createroom',
    { project_id: projectId, name: name, description: description }));
  }

  addImageToRoom(id: string, photoId: string): Promise<IRoom> {
    return this.convertAndHandleError(this.http.post<IRoom>('/_api/addimagetoroom', { id: id, photo_id: photoId }));
  }

  addMultiImageToRoom(id: string, photos: Array<string>): Promise<IRoom> {
    return this.convertAndHandleError(this.http.post<IRoom>('/_api/addmultiimagetoroom', { id: id, photos: photos }));
  }

  addSupplementsToRoom(id: string, supplements: Array<string>): Promise<IRoom> {
    return this.convertAndHandleError(this.http.post<IRoom>('/_api/addsupplementstoroom', { id: id, supplements: supplements }));
  }

  removeImage(id: string, photoId: string): Promise<IRoom> {
    return this.convertAndHandleError(this.http.post<IRoom>('/_api/removeimage', { id: id, photo_id: photoId }));
  }

  updateName(id: string, name: string): Promise<IRoom> {
    return this.convertAndHandleError(this.http.post<IRoom>('/_api/updateroomname', { id: id, name: name }));
  }

  updateDescription(id: string, description: string): Promise<IRoom> {
    return this.convertAndHandleError(this.http.post<IRoom>('/_api/updateroomdesc', { id: id, description: description }));
  }

  updateImageSequence(id: string, ids: Array<string>): Promise<IRoom> {
    return this.convertAndHandleError(this.http.post<IRoom>('/_api/updateimgseq', { id: id, ids: ids }));
  }

  updateSupplementSequence(id: string, ids: Array<string>): Promise<IRoom> {
    return this.convertAndHandleError(this.http.post<IRoom>('/_api/updatespplseq', { id: id, ids: ids }));
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

export interface IRoomAbridged {

  _id: string;
  name: string;
  description: string;
  date: Date;
  fotos: Array<IPhoto>;

}

export interface IRoom {

  _id: string;
  name: string;
  description: string;
  date: Date;
  geometries: Array<object>;
  fotos: Array<IPhoto>;
  supplements: Array<IPhoto>;

}
