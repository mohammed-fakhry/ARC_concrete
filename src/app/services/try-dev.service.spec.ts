import { TestBed } from '@angular/core/testing';

import { TryDevService } from './try-dev.service';

describe('TryDevService', () => {
  let service: TryDevService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TryDevService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
