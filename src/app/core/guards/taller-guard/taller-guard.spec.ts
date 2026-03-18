import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { tallerGuard } from './taller-guard/taller-guard';

describe('tallerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => tallerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
