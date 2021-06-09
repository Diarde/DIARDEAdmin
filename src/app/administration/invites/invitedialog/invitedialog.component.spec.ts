import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitedialogComponent } from './invitedialog.component';

describe('InvitedialogComponent', () => {
  let component: InvitedialogComponent;
  let fixture: ComponentFixture<InvitedialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvitedialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitedialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
