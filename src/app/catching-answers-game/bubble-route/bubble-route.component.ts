import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Bubble , ANIMATION_PROPERTIES, BubbleAnimation, DELAYS, BubbleState } from 'src/app/shared/types/types';
import anime from 'animejs'
import { GameActionsService } from 'micro-lesson-core';
import { CorrectablePart, PartCorrectness, PartFormat } from 'ox-types';
import { CatchingAnswersAnswerService } from 'src/app/shared/services/catching-answers-answer.service';
import { SubscriberOxDirective } from 'micro-lesson-components';
import { FeedbackOxService } from 'micro-lesson-core';

@Component({
  selector: 'app-bubble-route',
  templateUrl: './bubble-route.component.html',
  styleUrls: ['./bubble-route.component.scss']
})
export class BubbleRouteComponent extends SubscriberOxDirective implements OnInit, AfterViewInit{

  @ViewChild('bubbleContainer') bubbleContainer!: ElementRef;


  @Input() routeWidth!:number;
  @Input() bubbles!:Bubble[]; 
  @Input() bubbleSpeed!:number;
  @Input() animationIndex!:number;
  private bubbleAnimationState!:any;
  private bubbleAnimation!:BubbleAnimation;
  public currentBubble:Bubble = {
    route:1,
    isAnswer:false,
    state:'neutral',
    data:''
  }


  constructor(private gameActions:GameActionsService<any>,
              private answerService:CatchingAnswersAnswerService,
              private feedBackService: FeedbackOxService) { 
                super();
                this.addSubscription(this.gameActions.checkedAnswer, x => {
                  if(this.currentBubble.state === 'selected') {
                    this.answerCorrection()
                  }   
                })
              }
  



  ngOnInit(): void {
    console.log(this.bubbles);
  }



  ngAfterViewInit(): void {
    this.bubbleAnimation = new BubbleAnimation(this.bubbleSpeed, this.bubbleAnimationState, this.bubbleContainer, this.animationIndex, ANIMATION_PROPERTIES, DELAYS, this.bubbles, this.currentBubble)
    this.bubbleAnimation.bubbleAnimation();
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
    console.log(this.answerService.currentAnswer);
    this.gameActions.actionToAnswer.emit();
  }




  public selectBubble() {
   if (this.currentBubble.state === 'selected') {
    this.currentBubble.state = 'neutral'
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
    }
  }



}
