import { EventEmitter, Injectable } from '@angular/core';
import { ChallengeService, GameActionsService, SoundOxService } from 'micro-lesson-core';
import { ComposeService } from 'ox-animations';
import { CatchingAnswersExercise } from '../types/types';

@Injectable({
  providedIn: 'root'
})
export class CatchingAnswersComposeService extends ComposeService<CatchingAnswersExercise> {


  public animationTrigger = new EventEmitter<any>() 
  public bubbleRestoreAnimation = new EventEmitter<any>() 
  public composeEvent = new EventEmitter<{ composeInZero: boolean }>();


  constructor(challengeService: ChallengeService<CatchingAnswersExercise,any>, soundService: SoundOxService, 
    gameActions: GameActionsService<any>)  
  {
    super(challengeService, soundService, gameActions); 
  }

  
}
