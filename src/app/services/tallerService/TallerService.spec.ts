import { TestBed } from '@angular/core/testing';

import { TallerService } from './tallerService';

describe('Taller', () => {
  let service: TallerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TallerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
