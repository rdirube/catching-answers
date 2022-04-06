import { Component, Input, OnInit } from '@angular/core';
import { Bubble } from 'src/app/shared/types/types';

@Component({
  selector: 'app-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss']
})
export class BubbleComponent implements OnInit {

  
  public bubble!:Bubble;


  @Input() set  bubbleSetter (bubble : Bubble) {
    this.bubble = bubble;
    console.log(this.bubble);
 } 


  constructor() { }

  ngOnInit(): void {
  }

}
