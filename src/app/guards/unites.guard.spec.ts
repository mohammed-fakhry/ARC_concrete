import { TestBed } from '@angular/core/testing';

import { UnitesGuard } from './unites.guard';

describe('UnitesGuard', () => {
  let guard: UnitesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UnitesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
