import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import anime from 'animejs';
import { SubscriberOxDirective } from 'micro-lesson-components';
import { EndGameService, FeedbackOxService, GameActionsService, HintService, MicroLessonMetricsService, SoundOxService } from 'micro-lesson-core';
import { ComposeAnimGenerator } from 'ox-animations';
import { ExerciseOx } from 'ox-core';
import { anyElement, CorrectablePart, duplicateWithJSON, ExerciseData, MultipleChoiceSchemaData, PartCorrectness, PartFormat, shuffle } from 'ox-types';
import { filter, take, timer } from 'rxjs';
import { CatchingAnswersAnswerService } from 'src/app/shared/services/catching-answers-answer.service';
import { CatchingAnswersChallengeService } from 'src/app/shared/services/catching-answers-challenge.service';
import { CatchingAnswersComposeService } from 'src/app/shared/services/catching-answers-compose.service';
import { CatchingAnswersHintService } from 'src/app/shared/services/catching-answers-hint.service';
import { Bubble, ANIMATION_PROPERTIES, DELAYS, CatchingAnswersExercise, BubbleCreator, BubbleGenerator, Replacement, BubbleState, Surrender, HintGenerator, } from 'src/app/shared/types/types';

@Component({
  selector: 'app-game-body',
  templateUrl: './game-body.component.html',
  styleUrls: ['./game-body.component.scss']
})

export class GameBodyComponent extends SubscriberOxDirective implements OnInit, AfterViewInit {

  @ViewChild('routesContainer') routesContainer!: ElementRef;


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
  public surrenderArray: Surrender[] = [];
  private hintGenerator!:HintGenerator;


  constructor(private challengeService: CatchingAnswersChallengeService,
    private metricsService: MicroLessonMetricsService<any>,
    private gameActions: GameActionsService<any>,
    private hintService: HintService,
    private soundService: SoundOxService,
    private endService: EndGameService,
    private feedbackService: FeedbackOxService,
    private answerService: CatchingAnswersAnswerService,
    private composeService: CatchingAnswersComposeService,
    private hintServiceCatch:CatchingAnswersHintService) {
    super();
    this.composeService.setSubscriptions(this.composeService.composeEvent, false)
    this.hintService.usesPerChallenge = 2;
    this.bubblesSpeed = 10000;
    this.composeService.decomposeTime = 950;
    this.composeService.composeTime = 950;
    this.animationIndexes = shuffle(ANIMATION_PROPERTIES.map((x, i) => i));
    this.addSubscription(this.challengeService.currentExercise.pipe(filter(x => x !== undefined)),
      (exercise: ExerciseOx<CatchingAnswersExercise>) => {
        this.addMetric();
        const exerciseIndex = this.metricsService.currentMetrics.expandableInfo?.exercisesData.length as number;
        const allAnswersCorrect = this.allAnswersCorrect();
        this.overExercise = false;
        this.composeService.bubbleRestoreAnimation.emit();
        this.challengeService.removeAnimation.emit();
        this.exercise = exercise.exerciseData;
        this.hintService.usesPerChallenge = 2;
        if (exerciseIndex === 1) {
          this.nextExercise()
        }
        if (exerciseIndex > 1) {
          if (!allAnswersCorrect) {
            return
          } else {
            this.composeService.composeEvent.emit();
            this.challengeService.removeAnimation.emit();
          }
        }
      })
    this.addSubscription(this.composeService.composablesObjectsOut, x => {
      this.composeService.bubbleRestoreAnimation.emit();  
      this.nextExercise();
      
    }
    )
    this.addSubscription(this.challengeService.actionToAnswerEmit, x => {
      this.correctablePart();
    })
    this.addSubscription(this.gameActions.showHint, x => {
       if(this.hintService.currentUses === 1) {
         this.hintGenerator.firstHint(this.hintServiceCatch.firstHint)
       }
    })

  }




  nextExercise() {
    this.surrenderArray = []; 
    this.answerPerExercise = this.exercise.exercise.bubble.filter(bubble => bubble.isAnswer);    
    this.challengeService.correctAnswersPerExercise = [];
    this.routeArray = Array.from(Array(4).keys());
    this.surrenderArrayGenerator()
    this.statement = this.exercise.exercise.statement.text!;
    this.bubbles = this.exercise.exercise.bubble.map((bubble, i) => {
      return {
        data: bubble.content.text,
        isAnswer: bubble.isAnswer,
        state: 'neutral',
      }
    });
    this.bubbleGenerator = new BubbleGenerator(this.bubbles, this.routeArray, this.overExercise);
    this.bubbleGenerator.initialBubbleGenerator();
    this.hintGenerator = new HintGenerator(this.bubbleGenerator.bubbles, this.bubbleGenerator.bubbleGame);

  }




  ngOnInit(): void {
  }



  ngAfterViewInit(): void {
    this.composeService.addComposable(this.routesContainer.nativeElement, ComposeAnimGenerator.fromBot(), ComposeAnimGenerator.toTop('-140vh'), false);
  }



  public tryAnswer() {
    this.answerService.tryAnswer.emit();
  }



 private surrenderArrayGenerator():void {
  this.routeArray.forEach((r,i) => {
    if(i < this.answerPerExercise.length) {
      this.surrenderArray.push({
        state:true,
        id:i,
        data: this.answerPerExercise[i].content.text
      })
    } else {
      this.surrenderArray.push({
        state:false
      })
    }
  })
  this.surrenderArray = shuffle(this.surrenderArray);  
 }




  public bubbleReplacement(replacement: Replacement) {
    this.bubbleGenerator.bubbleReplacement(replacement);
  }



  allAnswersCorrect(): boolean {
    return this.answerPerExercise.length === this.challengeService.correctAnswersPerExercise.length
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
    console.log(correctablePart);

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
