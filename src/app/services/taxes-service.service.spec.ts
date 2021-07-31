import { TestBed } from '@angular/core/testing';

import { TaxesServiceService } from './taxes-service.service';

describe('TaxesServiceService', () => {
  let service: TaxesServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxesServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
