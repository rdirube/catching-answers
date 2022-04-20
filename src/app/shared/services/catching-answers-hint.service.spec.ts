import { TestBed } from '@angular/core/testing';

import { CatchingAnswersHintService } from './catching-answers-hint.service';

describe('CatchingAnswersHintService', () => {
  let service: CatchingAnswersHintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatchingAnswersHintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
