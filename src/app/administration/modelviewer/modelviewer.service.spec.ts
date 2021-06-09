import { TestBed } from '@angular/core/testing';

import { ModelviewerService } from './modelviewer.service';

describe('ModelviewerService', () => {
  let service: ModelviewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelviewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
