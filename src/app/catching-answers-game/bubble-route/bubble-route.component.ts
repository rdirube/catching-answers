import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Bubble, ANIMATION_PROPERTIES, BubbleAnimation, DELAYS, BubbleState, Replacement } from 'src/app/shared/types/types';
import anime from 'animejs'
import { ChallengeService, GameActionsService } from 'micro-lesson-core';
import { anyElement, CorrectablePart, duplicateWithJSON, PartCorrectness, PartFormat } from 'ox-types';
import { CatchingAnswersAnswerService } from 'src/app/shared/services/catching-answers-answer.service';
import { SubscriberOxDirective } from 'micro-lesson-components';
import { FeedbackOxService } from 'micro-lesson-core';
import { timer } from 'rxjs';
import { CatchingAnswersChallengeService } from 'src/app/shared/services/catching-answers-challenge.service';
import { ComposeAnimGenerator } from 'ox-animations';
import { CatchingAnswersComposeService } from 'src/app/shared/services/catching-answers-compose.service';

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

  @Input() set  bubbleSetter (bubble : Bubble) {
     this.bubble = bubble;
     if(this.bubbleContainer) {
      this.bubbleAnimation = new BubbleAnimation(this.bubbleSpeed, this.bubbleAnimationState, this.animationIndex, ANIMATION_PROPERTIES, DELAYS, this.bubble, this.routeIndex, this.overExercise ,this.bubbleContainer)
      this.bubbleAnimation.bubbleAnimation(this.newBubbleEmitter)
     }
  } 
  

  @Input() routeIndex!: number;
  @Input() bubbleSpeed!: number;
  @Input() animationIndex!: number;
  @Input() answerPerExercise!: number;
  @Input() overExercise!: boolean;
  @Input() stopAnimation!: boolean;
  @Output() newBubbleEmitter = new EventEmitter<Replacement>();
  @Output() removeCorrect = new EventEmitter<Bubble>()

  private bubbleAnimationState!: any;
  private isSelected!:boolean;
  public bubbleAnimation!: BubbleAnimation;
  public currentBubbles!: Bubble[];
  public bubble!:Bubble;
  
  constructor(private gameActions: GameActionsService<any>,
  private answerService: CatchingAnswersAnswerService,
  private feedBackService: FeedbackOxService,
  private challengeService: CatchingAnswersChallengeService,
  private composeService:CatchingAnswersComposeService
) {
  super();
  this.isSelected = false;
    this.addSubscription(this.gameActions.checkedAnswer, x => {
      if (this.bubble.state === 'selected') {
        this.answerCorrection()
      }
    })

    this.addSubscription(this.composeService.bubbleRestoreAnimation, x => {
      this.restoreBubbles();
    })
    this.addSubscription(this.challengeService.removeAnimation, x => {
     this.bubbleAnimation.bubbleAnimationState.pause();
    })
  }





  ngOnInit(): void {
  }





  ngAfterViewInit(): void {
    this.bubbleAnimation = new BubbleAnimation(this.bubbleSpeed, this.bubbleAnimationState, this.animationIndex, ANIMATION_PROPERTIES, DELAYS, this.bubble, this.routeIndex,this.overExercise ,this.bubbleContainer)
    this.bubbleAnimation.bubbleAnimation(this.newBubbleEmitter);
  }





  public selectBubble() {
    if(this.bubble.state !== 'correct') {
      if (this.bubble.state === 'selected') {
        this.bubble.state = 'neutral'
        this.bubbleAnimation.bubbleAnimationState.play();
      } else {
        this.bubble.state = 'selected'
        this.bubbleAnimation.bubbleAnimationState.pause();
        this.challengeService.actionToAnswerEmit.emit();
      }
    } 
  }





  private answerCorrection():void {
    this.bubble.state = this.bubble.isAnswer ? 'correct' : 'incorrect';
    if (this.bubble.state === 'incorrect') {
      this.bubbleAnimation.bubbleAnimationState.play();
    } else {
      this.removeCorrect.emit(this.bubble);
      this.challengeService.correctAnswersPerExercise.push(this.bubble);
      if(this.challengeService.correctAnswersPerExercise.length >= this.answerPerExercise) {
        this.feedBackService.endFeedback.emit();
      }
    }
  }


  
  private restoreBubbles():void {
    anime({
      targets: this.bubbleContainer.nativeElement,
      translateY: '0',
      duration:0   
    })
  }



}
