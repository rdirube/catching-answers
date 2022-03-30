import { Component, OnInit } from '@angular/core';
import { SubscriberOxDirective } from 'micro-lesson-components';
import { EndGameService, FeedbackOxService, GameActionsService, HintService, MicroLessonMetricsService, SoundOxService } from 'micro-lesson-core';
import { ExerciseOx } from 'ox-core';
import { anyElement, shuffle } from 'ox-types';
import { filter } from 'rxjs';
import { CatchingAnswersAnswerService } from 'src/app/shared/services/catching-answers-answer.service';
import { CatchingAnswersChallengeService } from 'src/app/shared/services/catching-answers-challenge.service';
import { Bubble, ANIMATION_PROPERTIES, DELAYS, CatchingAnswersExercise } from 'src/app/shared/types/types';

@Component({
  selector: 'app-game-body',
  templateUrl: './game-body.component.html',
  styleUrls: ['./game-body.component.scss']
})

export class GameBodyComponent extends SubscriberOxDirective implements OnInit {

  public bubbles!:Bubble[];
  public statement!:string;
  public bubblesSpeed!:number;
  public animationIndexes!:number[];
  public delayList!:number[];
  public exercise!: CatchingAnswersExercise;
  public routeArray!:number[];

  constructor(private challengeService: CatchingAnswersChallengeService,
    private metricsService: MicroLessonMetricsService<any>,
    private gameActions: GameActionsService<any>,
    private hintService: HintService,
    private soundService: SoundOxService,
    private endService: EndGameService,
    private feedbackService: FeedbackOxService,
    private answerService: CatchingAnswersAnswerService) 

   { 
     super();
     this.hintService.usesPerChallenge = 2;
     this.bubblesSpeed = 10000;
     this.animationIndexes = shuffle(ANIMATION_PROPERTIES.map((x,i) => i));
     this.addSubscription(this.challengeService.currentExercise.pipe(filter(x => x !== undefined)),
      (exercise: ExerciseOx<CatchingAnswersExercise>) => {
         this.exercise = exercise.exerciseData ;
         this.routeArray = Array.from(Array(4).keys());
         console.log(this.routeArray);
         this.statement = this.exercise.exercise.statement.text!;        
         this.bubbles = this.exercise.exercise.bubble.map((bubble,i) => {
           return {
             data: bubble.content.text,
             isAnswer: bubble.isAnswer,
             state:'neutral',
             route: i
           }
         });
         console.log(this.bubbles)
      })
  
    }


  ngOnInit(): void {
  }



  
  public tryAnswer() {
    this.answerService.tryAnswer.emit();
  }




}
