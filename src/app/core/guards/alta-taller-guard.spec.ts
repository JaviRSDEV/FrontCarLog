import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { altaTallerGuard } from './alta-taller-guard';

describe('altaTallerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => altaTallerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
