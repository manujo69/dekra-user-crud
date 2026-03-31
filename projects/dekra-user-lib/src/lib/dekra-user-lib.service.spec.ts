import { TestBed } from '@angular/core/testing';

import { DekraUserLibService } from './dekra-user-lib.service';

describe('DekraUserLibService', () => {
  let service: DekraUserLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DekraUserLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
