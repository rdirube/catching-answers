import { Injectable } from '@angular/core';
import { AnswerService, GameActionsService, MicroLessonMetricsService } from 'micro-lesson-core';
import { CatchingAnswersChallengeService } from './catching-answers-challenge.service';

@Injectable({
  providedIn: 'root'
})
export class CatchingAnswersAnswerService extends AnswerService {

  constructor(private gameActionsService: GameActionsService<any>,
    m: MicroLessonMetricsService<any>,
    private challenge: CatchingAnswersChallengeService) {
    super(gameActionsService, m)
   }
}
