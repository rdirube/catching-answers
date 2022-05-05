import { ThisReceiver } from '@angular/compiler';
import { EventEmitter, Injectable } from '@angular/core';
import { AppInfoOxService, ChallengeService, FeedbackOxService, GameActionsService, LevelService, SubLevelService } from 'micro-lesson-core';
import { ExerciseOx, PreloaderOxService } from 'ox-core';
import { duplicateWithJSON, ExpandableInfo, shuffle } from 'ox-types';
import { Bubble, BubbleCreator, CatchingAnswersExercise, CatchingAnswersNivelation } from '../types/types';

@Injectable({
  providedIn: 'root'
})



export class CatchingAnswersChallengeService extends ChallengeService<CatchingAnswersExercise,any> 
{
//   protected generateNextChallenge(subLevel: number): ExerciseOx<CatchingAnswersExercise> {
//     throw new Error('Method not implemented.');
//   }

  public exerciseConfig!: CatchingAnswersNivelation;
  public correctAnswersPerExercise:Bubble[] = [];
  public correctAnswerQuantity:number = 0;
  actionToAnswerEmit = new EventEmitter();
  removeAnimation = new EventEmitter();
  surrenderByBubble = new EventEmitter();
  private exercisePositionList: number[] = [];


  protected generateNextChallenge(subLevel: number): ExerciseOx<CatchingAnswersExercise> {
   console.log('hola');
   if(this.exerciseIndex === 0) {
    this.exercisePositionList.splice(0, this.exercisePositionList.length);
    const posArray = Array.from(Array(this.exerciseConfig.exercises.length).keys());
    const shufflePosArray = shuffle(posArray)
    if(this.exerciseConfig.advancedSettings.exercisesPerGame !== '') {
      for(let i = 0; i < this.exerciseConfig.advancedSettings.exercisesPerGame ; i++) {
        this.exercisePositionList.push(shufflePosArray[i])
      }
    } else {
      this.exercisePositionList = this.exerciseConfig.advancedSettings.isRandom === 'Sí' ? shufflePosArray : posArray;
    }   
   }
   const exercise = duplicateWithJSON({
    exercise:  this.exerciseConfig.exercises[this.exercisePositionList[this.exerciseIndex]].exercise
  })
    return new ExerciseOx(
      exercise as CatchingAnswersExercise, 1 , {
      maxTimeToBonus: 0,
      freeTime: 0
    }, []); 
  
   }





  protected equalsExerciseData(exerciseData: any, exerciseDoneData: any): boolean {
    return true
  }




  getMetricsInitialExpandableInfo(): ExpandableInfo {
   return  {
      exercisesData: [],
      exerciseMetadata: {
        exercisesMode: 'cumulative',
        exercisesQuantity: 'infinite',
      },
      globalStatement: [],
      timeSettings: {
        timeMode: 'total',
      },
  }
}



  constructor(gameActionsService: GameActionsService<any>, private levelService: LevelService,
    subLevelService: SubLevelService,
    private preloaderService: PreloaderOxService,
    private feedback: FeedbackOxService,
    private appInfo: AppInfoOxService) {
    super(gameActionsService, subLevelService, preloaderService);
    this.exerciseIndex = 0;
  }



  override beforeStartGame(): void  {
    const gameCase = 'created-config';
    console.log('this', this);
    switch (gameCase) {
      case 'created-config':
        console.log('challengeService')
        this.currentSubLevelPregeneratedExercisesNeeded = 1;
        this.exerciseConfig = this.getExerciseConfig();
        
        console.log(this.appInfo.microLessonInfo.creatorInfo?.exerciseCount);             
        break;
      default:
        throw new Error('Wrong game case recived from Wumbox');
    }  
  }


  public getExerciseConfig(): any {
    return this.appInfo.microLessonInfo.creatorInfo?.microLessonGameInfo;
  }




}
