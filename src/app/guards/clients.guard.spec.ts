import { TestBed } from '@angular/core/testing';

import { ClientsGuard } from './clients.guard';

describe('ClientsGuard', () => {
  let guard: ClientsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ClientsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
