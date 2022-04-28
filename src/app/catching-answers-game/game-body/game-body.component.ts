import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
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
  public bubbleAnswerInGame: Bubble[] = [];
  public surrenderArray: BubbleOut[] = [];
  private hintGenerator!: HintGenerator;
  public hintArray: BubbleOut[] = [];
  private selectBubbleCorrected!:number;
  private surrenderBubbles!:number;
  public hintImg!:string;
  public thirdHintActivated!:boolean;


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
    this.hintService.usesPerChallenge = 3;
    this.composeService.decomposeTime = 950;
    this.composeService.composeTime = 950;
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
        this.hintImg = this.exercise.exercise.statement.image as string
        if (exerciseIndex === 1) {
          this.bubblesSpeed = this.challengeService.exerciseConfig.advancedSettings * 1000;
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
      this.correctablePart();
    })


    this.addSubscription(this.gameActions.showHint, x => {
      if (this.hintService.currentUses === 1) {
        this.bubbleOutArrayGenerator(this.hintArray, this.routeArray.length - 1, false, this.exercise.exercise.bubble)
      } else if (this.hintService.currentUses === 2) {
        this.hintServiceCatch.secondHint.emit();
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
     console.log(this.bubbleGenerator.bubbleGame.filter(b => b.state === 'correct'))
     console.log(this.surrenderBubbles);
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
    this.hintService.usesPerChallenge = 3;
    this.answerPerExercise = this.exercise.exercise.bubble.filter(bubble => bubble.isAnswer);
    this.challengeService.correctAnswersPerExercise = [];
    this.routeArray = Array.from(Array(this.exercise.exercise.routeQuantity).keys());
    this.bubbleOutArrayGenerator(this.surrenderArray, this.answerPerExercise.length, true, this.answerPerExercise)
    this.statement = this.exercise.exercise.statement.text!;
    this.generateNewBubbles()
    this.bubbleGenerator.initialBubbleGenerator();
    this.hintGenerator = new HintGenerator(this.bubbleGenerator.bubbles, this.bubbleGenerator.bubbleGame, this.routeArray);
  }




  ngOnInit(): void {
  }



  ngAfterViewInit(): void {
    this.composeService.addComposable(this.routesContainer.nativeElement, ComposeAnimGenerator.fromBot(), ComposeAnimGenerator.toTop('-140vh'), false);
  }



  public tryAnswer() {
    this.answerService.tryAnswer.emit();
  }



  private bubbleOutArrayGenerator(arrayOut: BubbleOut[], iteration: number, isSurrender: boolean, bubblesForMethod: BubbleCreator[]): void {
    const bubblesShuffled = shuffle(bubblesForMethod);
    const bubblesToAdd = isSurrender ? bubblesShuffled : this.hintBubbleSelection(bubblesShuffled);
    this.routeArray.forEach((r, i) => {
      if (i < bubblesToAdd.length) {
        arrayOut.push({
          state: true,
          id: i,
          data: bubblesToAdd[i].content.text,
          isAnswer: bubblesToAdd[i].isAnswer
        })
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
    const optionsNoAnswer = bubblesShuffled.filter(b => !b.isAnswer);
    for (let i = 0; i < 1; i++) {
      arrayForHint.push(optionsNoAnswer[i])
    }
    return shuffle(arrayForHint) as BubbleCreator[];
  }




  public bubbleReplacement(replacement: Replacement) {
    this.bubbleGenerator.bubbleReplacement(replacement);
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
    this.bubbleGenerator = new BubbleGenerator(this.bubbles, this.routeArray, this.overExercise, this.bubbleAnswerInGame);
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
