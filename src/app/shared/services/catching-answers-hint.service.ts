import { EventEmitter, Injectable } from '@angular/core';
import { HintService } from 'micro-lesson-core';

@Injectable({
  providedIn: 'root'
})
export class CatchingAnswersHintService{


  firstHint = new EventEmitter<number>()
  secondHint = new EventEmitter();

  constructor() {
    
   }
}
