import { TestBed } from '@angular/core/testing';

import { ImageuploadService } from './imageupload.service';

describe('ImageuploadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImageuploadService = TestBed.get(ImageuploadService);
    expect(service).toBeTruthy();
  });
});
