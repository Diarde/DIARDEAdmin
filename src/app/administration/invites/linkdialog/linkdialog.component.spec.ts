import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkdialogComponent } from './linkdialog.component';

describe('LinkdialogComponent', () => {
  let component: LinkdialogComponent;
  let fixture: ComponentFixture<LinkdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkdialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
