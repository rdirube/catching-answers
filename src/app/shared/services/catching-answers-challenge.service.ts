import { EventEmitter, Injectable } from '@angular/core';
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
  public correctAnswersPerExercise:Bubble[] = [];
  public correctAnswerQuantity:number = 0;
  actionToAnswerEmit = new EventEmitter();
  removeAnimation = new EventEmitter();
  surrenderByBubble = new EventEmitter();


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
        console.log('challengeService')
        this.currentSubLevelPregeneratedExercisesNeeded = 1;
        console.log(this.getExerciseConfig())
        // this.exerciseConfig = this.getExerciseConfig();
        this.exerciseConfig = JSON.parse('{"supportedLanguages":{"es":true,"en":false},"isPublic":false,"ownerUid":"oQPbggIFzLcEHuDjp5ZNbkkVOlZ2","uid":"dUKr5JJrsVDOD47oscop","inheritedPedagogicalObjectives":[],"customTextTranslations":{"es":{"name":{"text":""},"description":{"text":""},"previewData":{"path":""}}},"backupReferences":"","type":"mini-lesson","libraryItemType":"resource","tagIds":{},"properties":{"customConfig":{"customMedia":["1651520008138keypress.mp3"],"creatorInfo":{"metricsType":"results","creatorType":"catching-answers","type":"challenges","screenTheme":"executive-functions","exerciseCount":4,"microLessonGameInfo":{"exercises":[{"exercise":{"statement":{"text":"Seleccionar","audio":"","image":"","video":""},"bubbleQuantity":"6","routeQuantity":4,"bubble":[{"content":{"text":"0","audio":"","video":"","image":""},"isAnswer":true},{"content":{"text":"1","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"2","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"3","audio":"","video":"","image":""},"isAnswer":true},{"content":{"text":"4","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"5","audio":"","video":"","image":""},"isAnswer":true}]}},{"exercise":{"statement":{"text":"Selecioneer mi burbuja preferida , que es la primera y ultima de la primer rueda, no olvidarse de eso por favor, muchas gracias y perdon por tan poco","audio":"","image":"","video":""},"bubbleQuantity":"8","routeQuantity":3,"bubble":[{"content":{"text":"7","audio":"","video":"","image":""},"isAnswer":true},{"content":{"text":"8","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"9","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"10","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"11","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"12","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"13","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"14","audio":"","video":"","image":""},"isAnswer":true}]}},{"exercise":{"statement":{"text":"Seleccioneeer","audio":"","image":"","video":""},"bubbleQuantity":"6","routeQuantity":4,"bubble":[{"content":{"text":"15","audio":"","video":"","image":""},"isAnswer":true},{"content":{"text":"16","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"17","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"18","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"19","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"20","audio":"","video":"","image":""},"isAnswer":true}]}},{"exercise":{"statement":{"text":"Selecioneizer","audio":"1651520008138keypress.mp3","image":"","video":""},"bubbleQuantity":"9","routeQuantity":4,"bubble":[{"content":{"text":"21","audio":"","video":"","image":""},"isAnswer":true},{"content":{"text":"22","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"23","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"24","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"25","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"26","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"27","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"28","audio":"","video":"","image":""},"isAnswer":false},{"content":{"text":"29","audio":"","video":"","image":""},"isAnswer":true}]}}],"advancedSettings":10}},"extraInfo":{"gameUrl":"","theme":"valle ","language":"ESP","exerciseCase":"created"}},"format":"catching-answers","miniLessonVersion":"with-custom-config-v2","miniLessonUid":"","url":"https://ml-screen-manager.firebaseapp.com"}}').properties.customConfig.creatorInfo.microLessonGameInfo;
        break;
      default:
        throw new Error('Wrong game case recived from Wumbox');
    }  
  }


  public getExerciseConfig(): any {
    return this.appInfo.microLessonInfo.creatorInfo?.microLessonGameInfo;
  }




}
