import { TestBed } from '@angular/core/testing';

import { SharedNotification } from './shared-notification';

describe('SharedNotification', () => {
  let service: SharedNotification;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedNotification);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
