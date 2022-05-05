
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { GameBodyComponent } from './game-body/game-body.component';
import { BubbleRouteComponent } from './bubble-route/bubble-route.component';
import { BubbleComponent } from './bubble/bubble.component';



@NgModule({
  declarations: [
    GameBodyComponent,
    BubbleRouteComponent,
    BubbleComponent
  ],
  imports: [
    SharedModule,
  ],
  exports:[
    GameBodyComponent
  ]
 
})


export class CatchingAnswersModule { }
