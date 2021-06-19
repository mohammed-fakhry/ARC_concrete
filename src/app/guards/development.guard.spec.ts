import { TestBed } from '@angular/core/testing';

import { DevelopmentGuard } from './development.guard';

describe('DevelopmentGuard', () => {
  let guard: DevelopmentGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DevelopmentGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
