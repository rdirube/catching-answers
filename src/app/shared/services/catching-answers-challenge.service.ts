import { Injectable } from '@angular/core';
import { AppInfoOxService, ChallengeService, FeedbackOxService, GameActionsService, LevelService, SubLevelService } from 'micro-lesson-core';
import { ExerciseOx, PreloaderOxService } from 'ox-core';
import { duplicateWithJSON, ExpandableInfo } from 'ox-types';
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
  public exerciseIndex!:number;
  public correctAnswersPerExercise:Bubble[] = [];



  protected generateNextChallenge(subLevel: number): ExerciseOx<CatchingAnswersExercise> {
  
   const exercise = duplicateWithJSON({
    exercise: this.exerciseConfig.exercises[this.exerciseIndex].exercise
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
        this.currentSubLevelPregeneratedExercisesNeeded = 1;
        // this.exerciseConfig = this.getExerciseConfig();
        this.exerciseConfig = JSON.parse('{"supportedLanguages":{"es":true,"en":false},"isPublic":false,"ownerUid":"oQPbggIFzLcEHuDjp5ZNbkkVOlZ2","uid":"dUKr5JJrsVDOD47oscop","inheritedPedagogicalObjectives":[],"customTextTranslations":{"es":{"name":{"text":""},"description":{"text":""},"previewData":{"path":""}}},"backupReferences":"","type":"mini-lesson","libraryItemType":"resource","tagIds":{},"properties":{"customConfig":{"customMedia":[],"creatorInfo":{"metricsType":"results","creatorType":"catching-answers","type":"challenges","screenTheme":"executive-functions","exerciseCount":2,"microLessonGameInfo":{"exercises":[{"exercise":{"statement":{"text":"Selecciona burbuja","audio":"","image":"","video":""},"bubbleQuantity":"4","bubble":[{"content":{"text":"hola","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"chau","audio":"","video":"","image":""},"isAnswer":true},{"content":{"text":"como","audio":"","video":"","image":""},"isAnswer":true},{"content":{"text":"va","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"termo","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"ping-pong","audio":"","video":"","image":""},"isAnswer":true}]}},{"exercise":{"statement":{"text":"dsavcx","audio":"","image":"","video":""},"bubbleQuantity":"3","bubble":[{"content":{"text":"ds","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"dsa","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"fds","audio":"","video":"","image":""},"isAnswer":false}]}}]}}},"format":"catching-answers","miniLessonVersion":"with-custom-config-v2","miniLessonUid":"","url":"https://ml-screen-manager.firebaseapp.com"}}').properties.customConfig.creatorInfo.microLessonGameInfo;
        console.log(this.exerciseConfig);
        break;
      default:
        throw new Error('Wrong game case recived from Wumbox');
    }  
  }


  public getExerciseConfig(): any {
    return this.appInfo.microLessonInfo.creatorInfo?.microLessonGameInfo;
  }




}
