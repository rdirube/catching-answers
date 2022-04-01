import { Component, Input, OnInit } from '@angular/core';
import { Bubble } from 'src/app/shared/types/types';

@Component({
  selector: 'app-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss']
})
export class BubbleComponent implements OnInit {

  


  @Input() bubble!:Bubble; 


  constructor() { }

  ngOnInit(): void {
  }

}
