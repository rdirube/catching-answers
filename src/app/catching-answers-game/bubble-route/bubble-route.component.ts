import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Bubble , ANIMATION_PROPERTIES, BubbleAnimation, DELAYS, BubbleState } from 'src/app/shared/types/types';
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
export class BubbleRouteComponent extends SubscriberOxDirective implements OnInit, AfterViewInit{

  @ViewChild('bubbleContainer') bubbleContainer!: ElementRef;


  @Input() routeWidth!:number;
  @Input() bubbles!:Bubble;

  @Input() bubble!:Bubble;
  @Input() i!:number;
  @Input() bubbleSpeed!:number;
  @Input() animationIndex!:number;
  @Output() newBubbleEmitter = new EventEmitter<{ index:boolean, bubble:Bubble }>();

  private bubbleAnimationState!:any;
  public bubbleAnimation!:BubbleAnimation;
  public currentBubble!:Bubble;
  public currentBubbles!:Bubble[];

  constructor(private gameActions:GameActionsService<any>,
              private answerService:CatchingAnswersAnswerService,
              private feedBackService: FeedbackOxService,
              private challengeService:CatchingAnswersChallengeService ,
              private composeService: CatchingAnswersComposeService) { 
                super();
                this.addSubscription(this.gameActions.checkedAnswer, x => {
                  if(this.currentBubble.state === 'selected') {
                    this.answerCorrection()
                  }   
                })
              }
  



  ngOnInit(): void {
  }



  ngAfterViewInit(): void {
    this.bubbleAnimation = new BubbleAnimation(this.bubbleSpeed, this.bubbleAnimationState, this.animationIndex, ANIMATION_PROPERTIES, DELAYS, this.bubble,  this.bubbleContainer)
    this.bubbleAnimation.bubbleAnimation(this.newBubbleEmitter);
    this.composeService.addComposable(this.bubbleContainer.nativeElement, ComposeAnimGenerator.fromBot(), ComposeAnimGenerator.toTop(), false);  
  }




  public correctablePart(): void {   
    const correctablePart = 
       [{
        correctness: (this.currentBubble.isAnswer ? 'correct' : 'wrong') as PartCorrectness,
        parts: [
          {
            format: 'word-text' as PartFormat,
            value: this.currentBubble.state as BubbleState
          }]
      }]
   
    this.answerService.currentAnswer = {
      parts: correctablePart as CorrectablePart[]
    }
    this.gameActions.actionToAnswer.emit();
  }




  public selectBubble() {
   if (this.currentBubble.state === 'selected') {
    this.currentBubble.state = 'neutral'
    this.bubbleAnimation.bubbleAnimationState.play();
   } else {
    this.currentBubble.state = 'selected'
    this.bubbleAnimation.bubbleAnimationState.pause();
   }
  
   this.correctablePart();
  }



  private answerCorrection() {
    this.currentBubble.state = this.currentBubble.isAnswer ? 'correct' : 'incorrect';
    this.feedBackService.endFeedback.emit();
    if(this.currentBubble.state === 'incorrect') {
      this.bubbleAnimation.bubbleAnimationState.play();
    } else {
      const bubbleCorrectIndex = this.currentBubbles.findIndex(bubble => bubble.data === this.bubble.data)
      this.challengeService.correctAnswersPerExercise.push(this.currentBubble);
      this.currentBubbles.splice(bubbleCorrectIndex, 1);
      console.log(this.challengeService.correctAnswersPerExercise);
    }
  }



}
