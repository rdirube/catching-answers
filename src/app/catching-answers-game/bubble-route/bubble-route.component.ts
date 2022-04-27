import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Bubble, ANIMATION_PROPERTIES, BubbleAnimation, DELAYS, BubbleState, Replacement, convertPXToVH, BubbleOut } from 'src/app/shared/types/types';
import anime from 'animejs'
import { ChallengeService, GameActionsService, HintService } from 'micro-lesson-core';
import { anyElement, CorrectablePart, duplicateWithJSON, PartCorrectness, PartFormat } from 'ox-types';
import { CatchingAnswersAnswerService } from 'src/app/shared/services/catching-answers-answer.service';
import { SubscriberOxDirective } from 'micro-lesson-components';
import { FeedbackOxService } from 'micro-lesson-core';
import { timer } from 'rxjs';
import { CatchingAnswersChallengeService } from 'src/app/shared/services/catching-answers-challenge.service';
import { ComposeAnimGenerator } from 'ox-animations';
import { CatchingAnswersComposeService } from 'src/app/shared/services/catching-answers-compose.service';
import { CatchingAnswersHintService } from 'src/app/shared/services/catching-answers-hint.service';

@Component({
  selector: 'app-bubble-route',
  templateUrl: './bubble-route.component.html',
  styleUrls: ['./bubble-route.component.scss']
})
export class BubbleRouteComponent extends SubscriberOxDirective implements OnInit, AfterViewInit {

  @ViewChild('bubbleContainer') bubbleContainer!: ElementRef;


  @Input() routeWidth!: number;
  @Input() bubbles!: Bubble;
  metricsService: any;

  @Input() set bubbleSetter(bubble: Bubble) {
    this.bubble = bubble;
    if (this.bubbleContainer) {
      this.bubbleAnimationInit()
    }
  }


  @Input() routeIndex!: number;
  @Input() animationIndex!: number;
  @Input() answerPerExercise!: number;
  @Input() overExercise!: boolean;
  @Input() stopAnimation!: boolean;
  @Input() isSurrender!: BubbleOut;
  @Input() isHint!: BubbleOut;

  @Output() newBubbleEmitter = new EventEmitter<Replacement>();
  @Output() removeCorrect = new EventEmitter<Bubble>()

  private bubbleAnimationState!: any;
  private isSelected!: boolean;
  public bubbleAnimation!: BubbleAnimation;
  public currentBubbles!: Bubble[];
  public bubble!: Bubble;

  constructor(private gameActions: GameActionsService<any>,
    private answerService: CatchingAnswersAnswerService,
    private feedBackService: FeedbackOxService,
    private hintService: HintService,
    private challengeService: CatchingAnswersChallengeService,
    private composeService: CatchingAnswersComposeService,
    private hintServiceCatch: CatchingAnswersHintService
  ) {
    super();
    this.isSelected = false;
    this.addSubscription(this.gameActions.checkedAnswer, x => {
      if (this.bubble.state === 'selected') {
        this.answerCorrection()
      } else if (this.bubble.state === 'neutral' && this.isHint !== undefined && this.isHint.state) {
        this.bubbleAnimation.bubbleAnimation(this.newBubbleEmitter, this.bubble.speed / 2, this.isHint.state)
      }
    })

    this.addSubscription(this.composeService.bubbleRestoreAnimation, x => {
      this.restoreBubbles();
    })


    this.addSubscription(this.gameActions.surrender, x => {
      this.bubblesOutIn(this.isSurrender, 'correct', true);
    })

    this.addSubscription(this.hintServiceCatch.firstHint, index => {
      this.bubblesOutIn(this.isHint, 'neutral', false)
    })
    this.addSubscription(this.hintServiceCatch.secondHint, x => {
      this.slowDownBubble();
    })
  }





  ngOnInit(): void {
  }





  ngAfterViewInit(): void {
    this.bubbleAnimationInit()
  }





  public selectBubble() {
    if (this.bubble.state !== 'correct') {
      if (this.bubble.state === 'selected') {
        this.bubble.state = 'neutral';
        this.bubbleAnimation.bubbleAnimationState.play();
      } else {
        this.bubble.state = 'selected'
        this.bubbleAnimation.bubbleAnimationState.pause();
        this.challengeService.actionToAnswerEmit.emit();
      }
    }
  }




  private bubbleAnimationInit(): void {
    anime.remove(this.bubbleContainer.nativeElement)
    this.bubbleAnimation = new BubbleAnimation(this.bubble.speed, this.bubbleAnimationState, this.animationIndex, ANIMATION_PROPERTIES, DELAYS, this.bubble, this.routeIndex, this.overExercise, this.bubbleContainer)
    this.bubbleAnimation.bubbleAnimation(this.newBubbleEmitter, this.bubble.speed, false)
  }




  private answerCorrection(): void {
    this.bubble.state = this.bubble.isAnswer ? 'correct' : 'incorrect';
    this.answerService.answerCorrection.emit();
    if (this.bubble.state === 'incorrect') {
      if (this.isHint !== undefined && this.isHint.state) {
        this.bubbleAnimation.bubbleAnimation(this.newBubbleEmitter, this.bubble.speed / 2, this.isHint.state)
      }
      this.bubbleAnimation.bubbleAnimationState.play();
    }
    else {
      this.removeCorrect.emit(this.bubble);
      this.challengeService.correctAnswersPerExercise.push(this.bubble);
    }
  }




  private restoreBubbles(): void {
    this.bubble.state = 'neutral';
    anime({
      targets: this.bubbleContainer.nativeElement,
      translateY: '0',
      duration: 0
    })
  }




  private bubblesOutIn(bubbleOut: BubbleOut, bubbleState: BubbleState, isSurrender: boolean): void {
    anime.remove(this.bubbleContainer.nativeElement)
    anime({
      targets: this.bubbleContainer.nativeElement,
      translateY: '-140vh',
      duration: 800,
      easing: 'linear',
      complete: () => {
        if (bubbleOut.state) {
          this.bubble.data = bubbleOut.data;
          this.bubble.isAnswer = bubbleOut.isAnswer as boolean;
          anime({
            targets: this.bubbleContainer.nativeElement,
            translateY: '0',
            duration: 0,
            complete: () => {
              this.bubble.state = bubbleState;
              anime({
                targets: this.bubbleContainer.nativeElement,
                translateY: '-70vh',
                duration: 2100,
                complete: () => {
                  if (isSurrender) {
                    if(!this.challengeService.correctAnswersPerExercise.find(b => b.data === this.bubble.data)) {
                      this.challengeService.correctAnswersPerExercise.push(this.bubble);
                      console.log(this.challengeService.correctAnswersPerExercise)

                    }
                    this.challengeService.surrenderByBubble.emit()
                  }
                }
              })
            }
          })
        } else if (!bubbleOut.state && !isSurrender) {
          this.bubbleAnimationInit();
        }
      }
    })
  }





  private slowDownBubble(): void {
    if (this.bubble.state !== 'correct') {
      anime.remove(this.bubbleContainer.nativeElement)
      this.bubble.speed += (this.bubble.speed * 0.3);
      this.bubbleAnimation.bubbleAnimation(this.newBubbleEmitter, this.bubble.speed, true)
    }
  }


}
