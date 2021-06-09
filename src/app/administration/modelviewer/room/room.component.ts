import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModelviewerService } from '../modelviewer.service';
import { Option, some, none, map, fold } from "fp-ts/lib/Option";
import { Subject, Subscription } from 'rxjs';
import { IRoom, RoomService } from 'src/app/services/room.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {

  selected: IRoom;
  rooms: IRoom[];

  private subscription: Option<Subscription> = none;

  constructor(private modelService: ModelviewerService, 
              private roomService: RoomService) { }

  ngOnInit() {

    this.subscription = some(this.modelService.projectIDSubject.subscribe(message => {
      fold(
        () => { this.rooms = []}, 
        (id: string) => {
          this.roomService.getRooms(id).then(rooms => {
            this.rooms = rooms;
          })
        })(message);
    }));

  }

  ngOnDestroy(){
    map((subscription: Subscription) => {subscription.unsubscribe(); })(this.subscription);
  }

  select(room: IRoom){
    this.selected = room;
    this.modelService.RoomID = room._id;
  }

}
