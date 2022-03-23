import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from './transloco-root.module';
import { AnswerService, ChallengeService } from 'micro-lesson-core';
import { CatchingAnswersChallengeService } from './shared/services/catching-answers-challenge.service';
import { CatchingAnswersAnswerService } from './shared/services/catching-answers-answer.service';
import { CatchingAnswersModule } from './catching-answers-game/catching-answers.module';
import { SharedModule } from './shared/shared.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslocoRootModule,
    CatchingAnswersModule,
    SharedModule
  ],
  providers: [{
  provide: ChallengeService,
  useExisting: CatchingAnswersChallengeService    
  },
{
  provide: AnswerService,
  useExisting: CatchingAnswersAnswerService
}],
  bootstrap: [AppComponent]
})
export class AppModule { }
