import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import anime from 'animejs';
import { SubscriberOxDirective } from 'micro-lesson-components';
import { EndGameService, FeedbackOxService, GameActionsService, HintService, MicroLessonMetricsService, SoundOxService } from 'micro-lesson-core';
import { ComposeAnimGenerator } from 'ox-animations';
import { ExerciseOx } from 'ox-core';
import { anyElement, CorrectablePart, duplicateWithJSON, ExerciseData, MultipleChoiceSchemaData, PartCorrectness, PartFormat, ScreenTypeOx, shuffle } from 'ox-types';
import { filter, take, timer } from 'rxjs';
import { CatchingAnswersAnswerService } from 'src/app/shared/services/catching-answers-answer.service';
import { CatchingAnswersChallengeService } from 'src/app/shared/services/catching-answers-challenge.service';
import { CatchingAnswersComposeService } from 'src/app/shared/services/catching-answers-compose.service';
import { CatchingAnswersHintService } from 'src/app/shared/services/catching-answers-hint.service';
import { Bubble, ANIMATION_PROPERTIES, DELAYS, CatchingAnswersExercise, BubbleCreator, BubbleGenerator, Replacement, BubbleState, BubbleOut, HintGenerator, } from 'src/app/shared/types/types';
import { BubbleRouteComponent } from '../bubble-route/bubble-route.component';

@Component({
  selector: 'app-game-body',
  templateUrl: './game-body.component.html',
  styleUrls: ['./game-body.component.scss']
})

export class GameBodyComponent extends SubscriberOxDirective implements OnInit, AfterViewInit {

  @ViewChild('routesContainer') routesContainer!: ElementRef;
  @ViewChildren('bubbleRoutes') bubbleRoutes!:QueryList<BubbleRouteComponent>

  public bubbles!: Bubble[];
  public bubbleGame!: Bubble[];
  public statement!: string;
  public bubblesSpeed!: number;
  public animationIndexes!: number[];
  public delayList!: number[];
  public exercise!: CatchingAnswersExercise;
  public routeArray!: number[];
  public routeQuantity!: number;
  public answerPerExercise: BubbleCreator[] = [];
  public bubbleGenerator!: BubbleGenerator;
  public overExercise!: boolean;
  public stopAnimation!: boolean;
  public bubbleAnswerInGame: Bubble[] = [];
  public surrenderArray: BubbleOut[] = [];
  private hintGenerator!: HintGenerator;
  public hintArray: BubbleOut[] = [];
  private selectBubbleCorrected!:number;
  private surrenderBubbles!:number;
  public hintImg!:string;
  private slowHintActivated!:boolean;
  public thirdHintActivated!:boolean;
  public isOneAnswer!:boolean;
  private routeComponentArr!:BubbleRouteComponent[];

  constructor(private challengeService: CatchingAnswersChallengeService,
    private metricsService: MicroLessonMetricsService<any>,
    private gameActions: GameActionsService<any>,
    private hintService: HintService,
    private soundService: SoundOxService,
    private endService: EndGameService,
    private feedbackService: FeedbackOxService,
    private answerService: CatchingAnswersAnswerService,
    private composeService: CatchingAnswersComposeService,
    private hintServiceCatch: CatchingAnswersHintService,
    private feedBackService: FeedbackOxService) {
    super();
    this.composeService.setSubscriptions(this.composeService.composeEvent, false)
    this.composeService.decomposeTime = 950;
    this.composeService.composeTime = 950;
    this.composeService.composeSoundPath = '';
    this.animationIndexes = shuffle(ANIMATION_PROPERTIES.map((x, i) => i));
    this.selectBubbleCorrected = 0;
    this.surrenderBubbles = 0;
    this.addSubscription(this.challengeService.currentExercise.pipe(filter(x => x !== undefined)),
      (exercise: ExerciseOx<CatchingAnswersExercise>) => {
        this.addMetric();
        const exerciseIndex = this.metricsService.currentMetrics.expandableInfo?.exercisesData.length as number;
        const allAnswersCorrect = this.allAnswersCorrect();
        this.overExercise = false;
        this.composeService.bubbleRestoreAnimation.emit();
        this.challengeService.removeAnimation.emit();
        this.exercise = exercise.exerciseData;
        this.thirdHintActivated = false;
        this.slowHintActivated = false;
        console.log(this.exercise.exercise.statement.image);
        this.hintImg = this.exercise.exercise.statement.image as string
        if (exerciseIndex === 1) {
          this.bubblesSpeed = this.challengeService.exerciseConfig.advancedSettings.speed * 1000;
          this.nextExercise()
        }

        if (exerciseIndex > 1) {
          if (!allAnswersCorrect) {
            return
          } else {
            this.composeService.composeEvent.emit();
          }
        }
      })


    this.addSubscription(this.composeService.composablesObjectsOut, x => {
      this.composeService.bubbleRestoreAnimation.emit();
      this.nextExercise();
    })


    this.addSubscription(this.challengeService.actionToAnswerEmit, x => {
      const selectedBubbles = this.bubbleGenerator.bubbleGame.filter(b => b.state === 'selected').length;
      const answerBubbles = this.bubbleGenerator.bubbles.filter(b => b.isAnswer).length;
      if(selectedBubbles >= answerBubbles) {
        this.correctablePart();
      }
    })


    this.addSubscription(this.gameActions.showHint, x => {
      if (this.hintService.currentUses === 1) {
        timer(300).subscribe(x=> {
          this.bubbleOutArrayGenerator(this.hintArray, false, this.exercise.exercise.bubble)
        })
      } else if (this.hintService.currentUses === 2) {
        this.hintServiceCatch.secondHint.emit();
        this.slowHintActivated = true;
      } else {
        this.thirdHintActivated = true;
      }
    })


    this.addSubscription(this.answerService.answerCorrection, x => {
    this.selectBubbleCorrected++;  
    this.correctablePart();
    if(this.bubbleGenerator.bubbleGame.filter(b => b.state === 'selected').length === 0) {
      this.feedbackService.endFeedback.emit();
      this.selectBubbleCorrected = 0;
    }
    })


    this.addSubscription(this.challengeService.surrenderByBubble, x => {
     this.surrenderBubbles++;
     if(this.answerPerExercise.length <= this.surrenderBubbles) {
     this.feedBackService.surrenderEnd.emit();
     this.surrenderBubbles = 0;
     }
    })

  }




  public nextExercise(): void {
    this.surrenderArray.splice(0, this.surrenderArray.length);;
    this.hintArray.splice(0, this.hintArray.length);
    this.bubbleAnswerInGame.splice(0, this.bubbleAnswerInGame.length);
    this.thirdHintActivated = false;
    this.slowHintActivated = false;
    this.hintService.usesPerChallenge = 3;
    this.answerPerExercise = this.exercise.exercise.bubble.filter(bubble => bubble.isAnswer);
    this.challengeService.correctAnswersPerExercise = [];
    this.routeArray = Array.from(Array(this.exercise.exercise.routeQuantity).keys());
    this.statement = this.exercise.exercise.statement.text!;
    this.generateNewBubbles();
    this.bubbleGenerator.initialBubbleGenerator();
    this.bubbleOutArrayGenerator(this.surrenderArray,  true, this.answerPerExercise);
    this.isOneAnswer = this.bubbleGenerator.bubbles.filter(b => b.isAnswer).length > 1 ? false : true;
    this.hintGenerator = new HintGenerator(this.bubbleGenerator.bubbles, this.bubbleGenerator.bubbleGame, this.routeArray);
    timer(100).subscribe(x => {
      this.routeComponentArr = this.bubbleRoutes.toArray();
    })

  }




  ngOnInit(): void {
  }



  ngAfterViewInit(): void {
    this.composeService.addComposable(this.routesContainer.nativeElement, ComposeAnimGenerator.fromBot(), ComposeAnimGenerator.toTop('-140vh'), false);
  }



  public tryAnswer() {
    this.answerService.tryAnswer.emit();
  }


  private bubblesInCondition(indexC1:number,indexC2:number ,numberToCompare:number,bubble: Bubble ,isSurrender:boolean):boolean {
   const c1 = indexC1 < numberToCompare;
   const c2 = indexC2 > 0 && bubble.state !== 'correct';
   return isSurrender ? c1 : c2; 
  }


  private bubbleOutArrayGenerator(arrayOut: BubbleOut[], isSurrender: boolean, bubblesForMethod: BubbleCreator[]): void {
    const bubblesShuffled = shuffle(bubblesForMethod);
    const bubblesToAdd = isSurrender ? bubblesShuffled : this.hintBubbleSelection(bubblesShuffled);
    let indexToAdd = bubblesToAdd.length;
    let hintIndex = 0;
    this.routeArray.forEach((r, i) => {
      if (this.bubblesInCondition(i , indexToAdd, bubblesToAdd.length, this.bubbleGenerator.bubbleGame[i], isSurrender)) {       
        arrayOut.push({
          state: true,
          id: i,
          data: bubblesToAdd[isSurrender ? i : hintIndex].content.text,
          isAnswer: bubblesToAdd[isSurrender ? i : hintIndex].isAnswer
        })
        if(!isSurrender) {
          indexToAdd --;
          hintIndex ++;
        } 
      } else {
        arrayOut.push({
          state: false
        })
      }  
    })
    if (!isSurrender) {
      timer(100).subscribe(x => {
        this.hintServiceCatch.firstHint.emit();
      })
    }
  }




  private hintBubbleSelection(bubblesShuffled: BubbleCreator[]): BubbleCreator[] {
    const arrayForHint = [];
    this.bubbleAnswerInGame.splice(0, this.bubbleAnswerInGame.length);
    const answersShuffledPossibleAns = this.bubbleGenerator.bubbles.filter(b => b.isAnswer && b.state !== 'correct');
    for (let i = 0; i < answersShuffledPossibleAns.length; i++) {
      arrayForHint.push({
        content:{
          text:answersShuffledPossibleAns[i].data,
          audio:'',
          video:'',
          image:''
        },
        isAnswer:true
      });
      this.bubbleAnswerInGame.push(answersShuffledPossibleAns[i]);
    }
    const correctAnswers = this.bubbleGenerator.bubbleGame.filter(b => b.state === 'correct').length;
    if(arrayForHint.length < (this.routeArray.length - correctAnswers)) {
      const optionsNoAnswer = bubblesShuffled.filter(b => !b.isAnswer);
      for (let i = 0; i < 1; i++) {
        arrayForHint.push(optionsNoAnswer[i])
      }
    }
    return shuffle(arrayForHint) as BubbleCreator[];
  }




  public bubbleReplacement(replacement: Replacement) {
    this.bubbleGenerator.bubbleReplacement(replacement, this.slowHintActivated);
  }

  

public playLoadedSound(sound?: string) {
  if(sound)
  this.soundService.playSoundEffect(sound, ScreenTypeOx.Game);
}



  allAnswersCorrect(): boolean {
    return this.answerPerExercise.length <= this.challengeService.correctAnswersPerExercise.length
  }


  private generateNewBubbles(): void {
    this.bubbles = this.exercise.exercise.bubble.map((bubble, i) => {
      return {
        data: bubble.content.text,
        isAnswer: bubble.isAnswer,
        state: 'neutral',
        speed: this.bubblesSpeed 
      }
    });
    this.bubbleGenerator = new BubbleGenerator(this.bubbles, this.routeArray, this.overExercise, this.bubbleAnswerInGame, this.slowHintActivated, this.bubblesSpeed);
  }



  removeCorrect(removedBubble: Bubble) {
    const removedIndex = this.bubbleGenerator.bubbles.findIndex(b => b.data === removedBubble.data);
    this.bubbleGenerator.bubbles.splice(removedIndex, 1);
  }




  public correctablePart(): void {
    const answersArray = this.bubbleGenerator.bubbles.filter(el => el.isAnswer);
    const selectedBubbles = this.bubbleGenerator.bubbleGame.filter(el => el.state === 'correct').concat(this.bubbleGenerator.bubbleGame.filter(el => el.state === 'selected'));
    const correctablePart = answersArray.map((ans, i) => {
      const correctnessToReturn = selectedBubbles.find(x => x.data === ans.data) ? true : false;
      return {
        correctness: (correctnessToReturn ? 'correct' : 'wrong') as PartCorrectness,
        parts: [
          {
            format: 'word-text' as PartFormat,
            value: ans.data as string
          }
        ]
      }
    })
    this.answerService.currentAnswer = {
      parts: correctablePart as CorrectablePart[]
    }
  }


  public deselectBubbles() {
    const bubbleIndexToPlay = this.bubbleGenerator.bubbleGame.findIndex(b => b.state === 'selected');
    this.routeComponentArr[bubbleIndexToPlay].bubbleAnimation.bubbleAnimationState.play();
    this.bubbleGenerator.bubbleGame.forEach(b => b.state = 'neutral')
  }


  private addMetric(): void {
    const myMetric: ExerciseData = {
      schemaType: 'multiple-choice',
      schemaData: {

      } as MultipleChoiceSchemaData,
      userInput: {
        answers: [],
        requestedHints: 0,
        surrendered: false
      },
      finalStatus: 'to-answer',
      maxHints: 1,
      secondsInExercise: 0,
      initialTime: new Date(),
      finishTime: undefined as any,
      firstInteractionTime: undefined as any
    };
    this.addSubscription(this.gameActions.actionToAnswer.pipe(take(1)), z => {
      myMetric.firstInteractionTime = new Date();
    });
    this.addSubscription(this.gameActions.checkedAnswer.pipe(take(1)),
      z => {
        myMetric.finishTime = new Date();
        console.log('Finish time');
      });
    this.metricsService.addMetric(myMetric as ExerciseData);
  }







}
