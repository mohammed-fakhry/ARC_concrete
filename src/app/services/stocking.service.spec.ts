import { TestBed } from '@angular/core/testing';

import { StockingService } from './stocking.service';

describe('StockingService', () => {
  let service: StockingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
