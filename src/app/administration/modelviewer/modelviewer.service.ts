import { Injectable, Output } from "@angular/core";
import { Option, some, none, map, fold } from "fp-ts/lib/Option";
import { Subject } from "rxjs";
import { IModel } from 'src/app/services/geometry.service';

@Injectable({
  providedIn: "root",
})
export class ModelviewerService {
  projectID: Option<string> = none;
  roomID: Option<string> = none;
  geometryID: Option<string> = none;

  public projectIDSubject: Subject<Option<string>> = new Subject();
  public roomIDSubject: Subject<
    Option<{ projectID: string; roomID: string }>
  > = new Subject();
  public geometryIDSubject: Subject<
    Option<{ projectID: string; roomID: string; geometryID: string }>
  > = new Subject();
  public renderModelSubject: Subject<IModel> = new Subject();

  constructor() {}

  set ProjectID(id: string) {
    this.projectID = id !== null ? some(id) : none;
    this.projectIDSubject.next(this.projectID);
    this.clearRoomID();
  }

  set RoomID(id: string) {
    this.roomID = id !== null ? some(id) : none;
    this.clearGeometryID();
    this.arrayFold(
      (a: Array<string>) => {
        if (a.length === 2) {
          this.roomIDSubject.next(some({ projectID: a[0], roomID: a[1] }));
        } else {
          this.roomIDSubject.next(none);
        }
      },
      () => {
        this.roomIDSubject.next(none);
      }
    )([this.projectID, this.roomID]);
  }

  set GeometryID(id: string) {
    this.geometryID = id !== null ? some(id) : none;
    this.arrayFold(
      (a: Array<string>) => {
        if (a.length === 3) {
          this.geometryIDSubject.next(
            some({ projectID: a[0], roomID: a[1], geometryID: a[2] })
          );
        } else {
          this.geometryIDSubject.next(none);
        }
      },
      () => {
        this.geometryIDSubject.next(none);
      }
    )([this.projectID, this.roomID, this.geometryID]);
  }

  set Model(model: IModel){
    this.renderModelSubject.next(model);
  }

  private clearRoomID = () => {
    this.roomID = none;
    this.roomIDSubject.next(none);
    this.clearGeometryID();
  };

  private clearGeometryID = () => {
    this.geometryID = none;
    this.geometryIDSubject.next(none);
  };

  private arrayFold = <T extends {}>(
    onSome: (a: Array<T>) => void,
    onNone: () => void
  ): ((array: Array<Option<T>>) => void) => {
    return (array: Array<Option<T>>) => {
      array.reverse();
      const recursive = (array: Array<Option<T>>, out: Array<T>) => {
        const value = array.pop();
        fold(
          () => {
            onNone();
          },
          (a: T) => {
            out.push(a);
            if (array.length > 0) {
              recursive(array, out);
            } else {
              onSome(out);
            }
          }
        )(value);
      };
      recursive(array,[]);
    };
  };
}
