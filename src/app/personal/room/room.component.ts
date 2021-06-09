import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { RoomService, IRoom } from 'src/app/services/room.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ImageuploadService } from '../../services/imageupload.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { ImagedialogComponent } from './imagedialog/imagedialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  _editName = false;
  _editDescription = false;
  left = '0px';
  top = '0px';
  photoID = '';
  photoFile = '';
  room = null;//{_id: "", name: "", fotos: null, supplements: null, description: ""};

  private persistName: (v: boolean) => void;
  private persistDescription: (v: boolean) => void;

  roomName = '';
  description = '';

  //@Input() room: IRoom;
  @ViewChild(MatMenuTrigger, { static: true }) triggers: MatMenuTrigger;
  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private roomService: RoomService,
    private imageuploadService: ImageuploadService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const projectID = params.projectID;
      const roomID = params.roomID;
      this.roomService.getRoom(projectID, roomID).then(room => {
        this.room = room;
      });
    })

  }

  dropPhoto(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.room.fotos, event.previousIndex, event.currentIndex);
    this.roomService.updateImageSequence(this.room._id, this.room.fotos.map(photo => photo._id)).then(_data => {
      this.updateRoom(_data);
    }).catch(() => {/*Error handled elsewhere*/ });
  }

  dropSupplement(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.room.fotos, event.previousIndex, event.currentIndex);
    this.roomService.updateSupplementSequence(this.room._id, this.room.supplements.map(photo => photo._id)).then(_data => {
      this.updateRoom(_data);
    }).catch(() => {/*Error handled elsewhere*/ });
  }

  uploadPhoto(event, roomId: string) {
    const files = event.target.files;
    document.body.style.cursor = 'wait';
    this.imageuploadService.uploadImages(files).then(data => {
      return this.imageuploadService.addImages(data['files']).then(_data => {
        this.roomService.addMultiImageToRoom(roomId, _data['ids']).then(_data2 => {
          document.body.style.cursor = 'default';
          this.updateRoom(_data2);
        });
      }).catch(() => {/*Error handled elsewhere*/ });
    });
  }

  uploadSupplement(event, supplementId: string) {
    const files = event.target.files;
    document.body.style.cursor = 'wait';
    this.imageuploadService.uploadImages(files).then(data => {
      this.imageuploadService.addImages(data['files']).then(_data => {
        return this.roomService.addSupplementsToRoom(supplementId, _data['ids']).then(_data2 => {
          document.body.style.cursor = 'default';
          this.updateRoom(_data2);
        });
      }).catch(() => {/*Error handled elsewhere*/ });
    });
  }

  editName = (oldName: string) => {
    // this._editName = true;
    // this.persistName = (_do: boolean) => {
    //   this._editName = false;
    //   _do ? this.roomService.updateName(this.room._id, this.roomName).then(_data => {
    //     this.updateRoom(_data);
    //   }).catch(() => {/*Error handled elsewhere*/ }) : this.roomName = oldName;
    // };
  }

  editDescription = (oldDescription: string) => {
    // this._editDescription = true;
    // this.persistDescription = (_do: boolean) => {
    //   this._editDescription = false;
    //   _do ? this.roomService.updateDescription(this.room._id, this.description).then(_data => {
    //     this.updateRoom(_data);
    //   }).catch(() => {/*Error handled elsewhere*/ }) : this.description = oldDescription;
    // };
  }

  contextMenu(event, id, filename) {
    this.left = `${event.clientX}px`;
    this.top = `${event.clientY}px`;
    this.triggers.openMenu();
    this.photoID = id;
    this.photoFile = filename;
    event.preventDefault();
  }

  openImageDialog(filename) {
    const dialogRef = this.dialog.open(ImagedialogComponent, {
      height: '880px',
      data: { image: filename }
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  delete(id) {
    this.roomService.removeImage(this.room._id, id).then(_data => {
      this.updateRoom(_data);
    }).catch(() => {/*Error handled elsewhere*/ });
  }

  private updateRoom(room: IRoom) {
    this.room = room;
  }

  download(filename) {
    const link = document.createElement('a');
    link.setAttribute('href', '/_uploads/' + filename);
    link.setAttribute('download', filename.split('/').pop());
    link.setAttribute('target', '_blank');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}
