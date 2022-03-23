
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { GameBodyComponent } from './game-body/game-body.component';



@NgModule({
  declarations: [
    GameBodyComponent
  ],
  imports: [
    SharedModule,
  ],
  exports:[
    GameBodyComponent
  ]
 
})


export class CatchingAnswersModule { }
