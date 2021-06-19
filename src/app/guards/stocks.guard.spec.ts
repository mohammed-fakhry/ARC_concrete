import { TestBed } from '@angular/core/testing';

import { StocksGuard } from './stocks.guard';

describe('StocksGuard', () => {
  let guard: StocksGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(StocksGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
