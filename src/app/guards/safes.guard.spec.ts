import { TestBed } from '@angular/core/testing';

import { SafesGuard } from './safes.guard';

describe('SafesGuard', () => {
  let guard: SafesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SafesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
