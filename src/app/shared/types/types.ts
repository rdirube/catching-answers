import { ElementRef, EventEmitter } from '@angular/core'
import anime from 'animejs'
import { anyElement, duplicateWithJSON, Showable, shuffle } from 'ox-types'


export type BubbleState = 'neutral' | 'correct' | 'incorrect' | 'selected';


export interface Bubble {
  isAnswer: boolean,
  state: BubbleState,
  data: any,
  speed:number
}


export interface AnimationProperties {
  leftToRight: boolean,
  xAxisOscilations: number,
  xAxisMovement: number,
  easing: string,
  durationDiff: number
}


export interface BubbleOut {
  state: boolean,
  id?: number,
  data?: any,
  isAnswer?: boolean
}


export interface CatchingAnswersNivelation {
  exercises: CatchingAnswersExercise[];
  advancedSettings: number;
}


export interface BubbleTime {
  seconds: number
}


export interface Replacement {
  lastBubble: Bubble,
  route: number
}


export interface BubleExerciseVariables {
  statement: Showable,
  bubbleQuantity: number,
  routeQuantity:number
  bubble: BubbleCreator[]
}


export interface CatchingAnswersExercise {
  exercise: BubleExerciseVariables
}



export interface BubbleCreator {
  content: Showable,
  isAnswer: boolean,
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



export const DELAYS: number[] = [500, 1000, 2000, 0, 2500, 4000, 3000, 3500]


export function convertPXToVH(px: number): number {
  return px * (100 / document.documentElement.clientHeight);
}



export class BubbleAnimation {

  private bubbleSpeed!: number;
  public bubbleAnimationState!: any;
  private bubbleContainer!: ElementRef | undefined;
  private animationProperties!: AnimationProperties[];
  private animationIndex!: number;
  private delayArray!: number[];
  private bubble!: Bubble;
  private routeIndex!: number;
  private isFinished!: boolean


  constructor(bubbleSpeed: number, bubbleAnimationState: any, animationIndex: number, animationProperties: AnimationProperties[], delayArray: number[], bubble: Bubble, routeIndex: number, isFinished: boolean, bubbleContainer?: ElementRef) {
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




  public bubbleAnimation(newBubble: EventEmitter<Replacement>, bubbleSpeed: number, isHint:boolean, oscilationsRatio:number) {
    const animationsShuffle = shuffle(this.animationProperties)
    const currentAnimation = animationsShuffle[this.animationIndex];
    const shuffleDelays = shuffle(this.delayArray)
    const currentDelay = shuffleDelays[this.animationIndex]
    const xAxisMovement = Array.from(Array(Math.floor(currentAnimation.xAxisOscilations/oscilationsRatio)).keys()).map((z, i) => {
      return {
        value: (i * z) % 2 === 0 ? currentAnimation.leftToRight ? currentAnimation.xAxisMovement + 'vh' : '-' + currentAnimation.xAxisMovement + 'vh' : currentAnimation.leftToRight ? '-' + currentAnimation.xAxisMovement + 'vh' : currentAnimation.xAxisMovement + 'vh', duration: (bubbleSpeed + currentAnimation.durationDiff) / currentAnimation.xAxisOscilations,
        easing: currentAnimation.easing
      }
    })
    this.bubbleAnimationState = anime({
      targets: this.bubbleContainer!.nativeElement,
      translateY: [{ value: '-140vh', duration: bubbleSpeed + currentAnimation.durationDiff, easing: 'linear', delay: isHint ? 0 : currentDelay }],
      translateX: xAxisMovement,
      complete: () => {
        anime({
          targets: this.bubbleContainer!.nativeElement,
          translateY: '0',
          duration: 0
        })
        console.log(newBubble)
        newBubble.emit({
          lastBubble: this.bubble,
          route: this.routeIndex
        })
     
      }
    })
  }

}






export class BubbleGenerator {

  public bubbles!: Bubble[];
  public indexToModify!: number;
  public bubbleGame: Bubble[] = [];
  public routeArray!: number[];
  public bubbleAnswerInGame!: Bubble[];
  private bubbleAcc: Bubble[] = [];
  public init!: boolean;
  private isAnswerList!: Bubble[];
  public slowHintActivated!:boolean;
  public standardSpeed!:number;

  
  constructor(bubbles: Bubble[], routeArray: number[], init: boolean, bubbleAnswerInGame: Bubble[], slowHintActivated:boolean, standardSpeed:number) {
    this.bubbles = bubbles;
    this.routeArray = routeArray;
    this.init = init;
    this.bubbleAnswerInGame = bubbleAnswerInGame;
    this.slowHintActivated = slowHintActivated;
    this.standardSpeed = standardSpeed;
  }




  public initialBubbleGenerator() {
    this.isAnswerList = this.bubbles.filter(bubble => bubble.isAnswer);
    const answerSelected = anyElement(this.isAnswerList);
    const answerSelectedCopy = duplicateWithJSON(answerSelected)
    this.routeArray.forEach((route, i) => {
      if (i === 0) {
        this.bubbleGame.push(answerSelectedCopy);
        this.bubbleAnswerInGame.push(answerSelected);
      } else {
        const filteredBubbles = this.bubbles.filter(b => !this.bubbleAnswerInGame.includes(b));
        const bubbleToAdd = anyElement(filteredBubbles);
        const bubbleToAddCopy = duplicateWithJSON(bubbleToAdd)
        if (bubbleToAdd.isAnswer) {
          this.bubbleAnswerInGame.push(bubbleToAdd);
        }
        this.bubbleGame.push(bubbleToAddCopy);
      }
    })
    this.bubbleGame = shuffle(this.bubbleGame);
  }




  public bubbleReplacement(replacement: Replacement, slowHintActivated:boolean) {
    const filteredBubbles = this.bubbles.filter(b => !this.bubbleAnswerInGame.includes(b) && b.data !== replacement.lastBubble.data);
    const candidateToReplace = anyElement(filteredBubbles);
    const bubbleToReplace = this.answerForceBubble(this.bubbleAcc, candidateToReplace)
    const bubbleToAdd = duplicateWithJSON(bubbleToReplace);
    const indexLastAnswer = this.bubbleAnswerInGame.findIndex(b => b.data === replacement.lastBubble.data);
    if (!bubbleToReplace.isAnswer && replacement.lastBubble.isAnswer) {
      this.bubbleAnswerInGame.splice(indexLastAnswer, 1)
    }
    else if (bubbleToReplace.isAnswer) {
      if (replacement.lastBubble.isAnswer) {
        this.bubbleAnswerInGame.splice(indexLastAnswer, 1, bubbleToReplace);
      } else {
        this.bubbleAnswerInGame.push(bubbleToReplace);
      }
    }
    bubbleToReplace.state = 'neutral';
    bubbleToAdd.speed = slowHintActivated ? this.standardSpeed + (this.standardSpeed * 0.3) : this.standardSpeed;
    this.bubbleGame.splice(replacement.route, 1, bubbleToAdd);
    this.bubbleAcc.push(bubbleToAdd);
  }




  private answerForceBubble(bubbleAcc: Bubble[], bubbleToReplace: Bubble): Bubble {
    const answersAvaiable = this.isAnswerList.filter(ans => !this.bubbleAnswerInGame.includes(ans));
    if (bubbleAcc.length >= this.routeArray.length) {
      const areAnswers = answersAvaiable.length ? answersAvaiable.filter(b => bubbleAcc.some(a => b.data != a.data)) : [];
      bubbleAcc.shift();
      if (!bubbleToReplace.isAnswer && areAnswers.length) {
        return anyElement(areAnswers);
      } else {
        return bubbleToReplace
      }
    } else {
      return bubbleToReplace
    }
  }


}






export class HintGenerator {
  public bubbles!: Bubble[];
  public bubblesInGame!: Bubble[];
  public routeArray!: number[];

  constructor(bubbles: Bubble[], bubblesInGame: Bubble[], routeArray: number[]) {
    this.bubbles = bubbles;
    this.bubblesInGame = bubblesInGame;
    this.routeArray = routeArray;
  }


  public firstHint(animationEmit: EventEmitter<number>): void {
    const bubbleNotAnswer = this.bubbles.filter(b => !b.isAnswer)
    const trapsInGame = bubbleNotAnswer.filter(b => this.bubblesInGame.some(bg => b.data === bg.data))
    const bubbleToFreeze = anyElement(trapsInGame);
    const routeToFreeze = this.bubblesInGame.findIndex(b => b.data === bubbleToFreeze.data);
    animationEmit.emit(routeToFreeze);
  }



  public secondHint(): void {
    const bubbleNotAnswer = this.bubbles.filter(b => !b.isAnswer)
    const bubbleToFreeze = anyElement(bubbleNotAnswer);
    const shuffleRoutes = shuffle(this.routeArray);
    const routesToFreeze = []
    for (let i = 0; i < this.routeArray.length - 2; i++) {
      routesToFreeze.push(shuffleRoutes[i])
    }
  }



}