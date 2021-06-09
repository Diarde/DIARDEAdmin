import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelviewerComponent } from './modelviewer.component';

describe('ModelviewerComponent', () => {
  let component: ModelviewerComponent;
  let fixture: ComponentFixture<ModelviewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelviewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
