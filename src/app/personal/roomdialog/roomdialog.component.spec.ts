import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomdialogComponent } from './roomdialog.component';

describe('RoomdialogComponent', () => {
  let component: RoomdialogComponent;
  let fixture: ComponentFixture<RoomdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomdialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
