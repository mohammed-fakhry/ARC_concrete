import { TestBed } from '@angular/core/testing';

import { ConcreteService } from './concrete.service';

describe('ConcreteService', () => {
  let service: ConcreteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConcreteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
