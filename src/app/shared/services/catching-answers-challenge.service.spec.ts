import { TestBed } from '@angular/core/testing';

import { CatchingAnswersChallengeService } from './catching-answers-challenge.service';

describe('CatchingAnswersChallengeService', () => {
  let service: CatchingAnswersChallengeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatchingAnswersChallengeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
