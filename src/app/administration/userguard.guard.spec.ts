import { TestBed, async, inject } from '@angular/core/testing';

import { UserguardGuard } from './userguard.guard';

describe('UserguardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserguardGuard]
    });
  });

  it('should ...', inject([UserguardGuard], (guard: UserguardGuard) => {
    expect(guard).toBeTruthy();
  }));
});
