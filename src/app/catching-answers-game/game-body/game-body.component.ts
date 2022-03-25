import { Component, OnInit } from '@angular/core';
import { SubscriberOxDirective } from 'micro-lesson-components';
import { EndGameService, FeedbackOxService, GameActionsService, HintService, MicroLessonMetricsService, SoundOxService } from 'micro-lesson-core';
import { CatchingAnswersAnswerService } from 'src/app/shared/services/catching-answers-answer.service';
import { CatchingAnswersChallengeService } from 'src/app/shared/services/catching-answers-challenge.service';
import { Bubble } from 'src/app/shared/types/types';

@Component({
  selector: 'app-game-body',
  templateUrl: './game-body.component.html',
  styleUrls: ['./game-body.component.scss']
})
export class GameBodyComponent extends SubscriberOxDirective implements OnInit {

  public bubbles:Bubble[] = [{route:0, isAnswer:false, state: 'neutral'},{route:1, isAnswer:true, state: 'neutral'},{route:2, isAnswer:false, state: 'neutral'},{route:3, isAnswer:false, state: 'neutral'}];
  public statement:string = "Selecciona burbuja";


  constructor(private challengeService: CatchingAnswersChallengeService,
    private metricsService: MicroLessonMetricsService<any>,
    private gameActions: GameActionsService<any>,
    private hintService: HintService,
    private soundService: SoundOxService,
    private endService: EndGameService,
    private feedbackService: FeedbackOxService,
    private answerService: CatchingAnswersAnswerService,
   )  { 
    super();
    this.hintService.usesPerChallenge = 2;

   
  }

  ngOnInit(): void {
  }


  
  public tryAnswer() {
    this.answerService.tryAnswer.emit();
    
  }

}
