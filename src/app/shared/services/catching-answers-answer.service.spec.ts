import { TestBed } from '@angular/core/testing';

import { CatchingAnswersAnswerService } from './catching-answers-answer.service';

describe('CatchingAnswersAnswerService', () => {
  let service: CatchingAnswersAnswerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatchingAnswersAnswerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
