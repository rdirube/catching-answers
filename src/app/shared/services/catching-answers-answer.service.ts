import { EventEmitter, Injectable } from '@angular/core';
import { AnswerService, GameActionsService, MicroLessonMetricsService } from 'micro-lesson-core';
import { UserAnswer } from 'ox-types';
import { CatchingAnswersChallengeService } from './catching-answers-challenge.service';

@Injectable({
  providedIn: 'root'
})
export class CatchingAnswersAnswerService extends AnswerService {

   
  answerCorrection = new EventEmitter();


  protected override isValidAnswer(answer: UserAnswer): boolean {
    return this.currentAnswer.parts.every(part => part.parts.every(part => part.value !== null))
  }
  

  constructor(private gameActionsService: GameActionsService<any>,
    m: MicroLessonMetricsService<any>,
    private challenge: CatchingAnswersChallengeService) {
    super(gameActionsService, m)

    this.gameActionsService.showNextChallenge.subscribe(value => {
      this.cleanAnswer();
    });
    this.gameActionsService.finishedTimeOfExercise.subscribe(() => {
      console.log('finishedTimeOfExercise');
      this.onTryAnswer();
    });
   }

   public cleanAnswer(): void {
    this.currentAnswer = { parts: [] };
  }

   
}
