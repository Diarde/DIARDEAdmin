import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as HttpStatusCode from 'http-status-codes';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ImageuploadService {

  constructor(private http: HttpClient, private router: Router) {
  }

  uploadImage(file) {
    const uploadData = new FormData();
    uploadData.append('file', file, file.name);
    return this.convertAndHandleError(this.http.post('_api/imageupload', uploadData));
  }

  uploadImages(files) {
    const uploadData = new FormData();
    for (const file of files) {
      uploadData.append('file', file, file.name);
    }
    return this.convertAndHandleError(this.http.post('_api/multiimageupload', uploadData));
  }

  addImage(name: string) {
    return this.convertAndHandleError(this.http.post<IPhoto>('_api/addimage', { filename: name }));
  }

  addImages(names: Array<string>) {
    return this.convertAndHandleError(this.http.post<IPhoto>('_api/addmultiimage', { filenames: names }));
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

export interface IPhoto {

  _id: string;
  filename: string;
  date: Date;
  owner: string;

}
