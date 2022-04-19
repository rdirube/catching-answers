import { ElementRef, EventEmitter } from '@angular/core'
import anime from 'animejs'
import { anyElement, duplicateWithJSON, Showable, shuffle } from 'ox-types'


export type BubbleState = 'neutral' | 'correct' | 'incorrect' | 'selected' ;




export interface Bubble {
  isAnswer: boolean,
  state: BubbleState,
  data: any
}

export interface AnimationProperties {
  leftToRight: boolean,
  xAxisOscilations: number,
  xAxisMovement: number,
  easing: string,
  durationDiff: number
}


export interface CatchingAnswersNivelation {
  exercises: CatchingAnswersExercise[];
}

export interface Replacement {
  lastBubble:Bubble,
  route:number
}


export interface BubleExerciseVariables {
  statement: Showable,
  bubbleQuantity: number,
  bubble: BubbleCreator[]
}


export interface CatchingAnswersExercise {
  exercise: BubleExerciseVariables
}



export interface BubbleCreator {
  content: Showable,
  isAnswer:boolean,
}





export const ANIMATION_PROPERTIES: AnimationProperties[] = [{
  leftToRight: true,
  xAxisOscilations: 6,
  xAxisMovement: 1.5,
  easing: 'linear',
  durationDiff: 0
},
{

  leftToRight: false,
  xAxisOscilations: 5,
  xAxisMovement: 1.9,
  easing: 'linear',

  durationDiff: 300
}, {

  leftToRight: true,
  xAxisOscilations: 4,
  xAxisMovement: 1.1,
  easing: 'linear',

  durationDiff: 500
}, {

  leftToRight: false,
  xAxisOscilations: 8,
  xAxisMovement: 2,
  easing: 'linear',
  durationDiff: 175
}]



export const DELAYS: number[] = [500, 1000 ,2000, 0, 2500, 4000, 3000, 3500]





export class BubbleAnimation {

  private bubbleSpeed!: number;
  public bubbleAnimationState!: any;
  private bubbleContainer!: ElementRef | undefined;
  private animationProperties!: AnimationProperties[];
  private animationIndex!: number;
  private delayArray!:number[];
  private bubble!:Bubble;
  private routeIndex!:number;
  private isFinished!:boolean


  constructor(bubbleSpeed: number, bubbleAnimationState: any, animationIndex: number, animationProperties: AnimationProperties[], delayArray:number[], bubble:Bubble, routeIndex:number, isFinished:boolean ,bubbleContainer?: ElementRef) {
    this.bubbleSpeed = bubbleSpeed;
    this.bubbleAnimationState = bubbleAnimationState;
    this.bubbleContainer = bubbleContainer;
    this.animationProperties = animationProperties;
    this.animationIndex = animationIndex;
    this.delayArray = delayArray;
    this.bubble = bubble;
    this.routeIndex = routeIndex;
    this.isFinished = isFinished;
  }




  public bubbleAnimation(newBubble: EventEmitter<Replacement>) {
    const animationsShuffle = shuffle(this.animationProperties)
    const currentAnimation = animationsShuffle[this.animationIndex];
    const shuffleDelays = shuffle(this.delayArray)
    const currentDelay = shuffleDelays[this.animationIndex]
    const xAxisMovement = Array.from(Array(currentAnimation.xAxisOscilations).keys()).map((z, i) => {
      return {
        value: (i * z) % 2 === 0 ? currentAnimation.leftToRight ? currentAnimation.xAxisMovement + 'vh' : '-' + currentAnimation.xAxisMovement + 'vh' : currentAnimation.leftToRight ? '-' + currentAnimation.xAxisMovement + 'vh' : currentAnimation.xAxisMovement + 'vh', duration: (this.bubbleSpeed + currentAnimation.durationDiff) / currentAnimation.xAxisOscilations,
        easing: currentAnimation.easing
      }
    })
    this.bubbleAnimationState = anime({
      targets: this.bubbleContainer!.nativeElement,
      translateY: [{ value: '-140vh', duration: this.bubbleSpeed + currentAnimation.durationDiff, easing: 'linear', delay: currentDelay }],
      translateX: xAxisMovement,
      complete: () => {
        anime({
          targets: this.bubbleContainer!.nativeElement,
          translateY: '0',
          duration:0
        })
          newBubble.emit({
            lastBubble:this.bubble,
            route: this.routeIndex
          })
        
      } 
    })
    this.bubbleAnimationState.play();
  }

}





export class BubbleGenerator {

  public bubbles!:Bubble[];
  public indexToModify!:number;
  public bubbleGame:Bubble[] = [];
  public routeArray!:number[];
  private bubbleAnswerInGame:Bubble[] = [];
  public init!:boolean;


  constructor(bubbles:Bubble[],routeArray:number[], init:boolean) {
    this.bubbles = bubbles;
    this.routeArray = routeArray;
    this.init = init
  }



  public initialBubbleGenerator() {
    const isAnswerList = this.bubbles.filter(bubble => bubble.isAnswer);
    const  answerSelected = anyElement(isAnswerList);
    this.routeArray.forEach((route,i) => {
      if(i === 0) {
         this.bubbleGame.push(answerSelected);
         this.bubbleAnswerInGame.push(answerSelected);        
      } else {
        const filteredBubbles = this.bubbles.filter(b => !this.bubbleAnswerInGame.includes(b));
        const bubbleToAdd = anyElement(filteredBubbles);
        if(bubbleToAdd.isAnswer) {
          this.bubbleAnswerInGame.push(bubbleToAdd);
        }
        this.bubbleGame.push(bubbleToAdd);
      }
    })
    this.bubbleGame = shuffle(this.bubbleGame);
  }



  public bubbleReplacement(replacement:Replacement) {
    const filteredBubbles = this.bubbles.filter(b => !this.bubbleAnswerInGame.includes(b) && b !== replacement.lastBubble);
    const bubbleToAdd = anyElement(filteredBubbles);
    const indexLastAnswer = this.bubbleAnswerInGame.findIndex(b => b === replacement.lastBubble);
    if(!bubbleToAdd.isAnswer && replacement.lastBubble.isAnswer) {
      this.bubbleAnswerInGame.splice(indexLastAnswer, 1)
    }
    else if(bubbleToAdd.isAnswer) {
      if(replacement.lastBubble.isAnswer) {
        this.bubbleAnswerInGame.splice(indexLastAnswer,1,bubbleToAdd);
      } else {
        this.bubbleAnswerInGame.push(bubbleToAdd);
      }
    }
    bubbleToAdd.state = 'neutral' 
    this.bubbleGame.splice(replacement.route,1,bubbleToAdd);
    } 
  

  

} 