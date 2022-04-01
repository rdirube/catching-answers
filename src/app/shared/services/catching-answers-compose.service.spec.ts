import { TestBed } from '@angular/core/testing';

import { CatchingAnswersComposeService } from './catching-answers-compose.service';

describe('CatchingAnswersComposeService', () => {
  let service: CatchingAnswersComposeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatchingAnswersComposeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
