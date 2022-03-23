import { Injectable } from '@angular/core';
import { AppInfoOxService, ChallengeService, FeedbackOxService, GameActionsService, LevelService, SubLevelService } from 'micro-lesson-core';
import { ExerciseOx, PreloaderOxService } from 'ox-core';
import { ExpandableInfo } from 'ox-types';

@Injectable({
  providedIn: 'root'
})
export class CatchingAnswersChallengeService extends ChallengeService<any,any>{
  protected generateNextChallenge(subLevel: number): ExerciseOx<any> {
    throw new Error('Method not implemented.');
  }
  protected equalsExerciseData(exerciseData: any, exerciseDoneData: any): boolean {
    throw new Error('Method not implemented.');
  }
  getMetricsInitialExpandableInfo(): ExpandableInfo {
    throw new Error('Method not implemented.');
  }

  constructor(gameActionsService: GameActionsService<any>, private levelService: LevelService,
    subLevelService: SubLevelService,
    private preloaderService: PreloaderOxService,
    private feedback: FeedbackOxService,
    private appInfo: AppInfoOxService) {
    super(gameActionsService, subLevelService, preloaderService);
  }
}
