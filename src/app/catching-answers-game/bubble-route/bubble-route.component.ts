import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Bubble } from 'src/app/shared/types/types';
import anime from 'animejs'


@Component({
  selector: 'app-bubble-route',
  templateUrl: './bubble-route.component.html',
  styleUrls: ['./bubble-route.component.scss']
})
export class BubbleRouteComponent implements OnInit, AfterViewInit{

  @ViewChild('bubbleContainer') bubbleContainer!: ElementRef;


  @Input() routeWidth!:number;
  @Input() bubble!:Bubble; 
  @Input() speedMovement!:number;

  constructor() { }
  

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.bubbleAnimation();
  }

 
  bubbleAnimation() {
    anime({
      targets:this.bubbleContainer.nativeElement,
      translateY:[{value:'-120vh', duration: 10000, easing: 'linear'}],
      translateX: [{value:['8vh', '-8vh'],duration:500 ,loop:true,  direction: 'alternate', easing: 'easeInOutSine'}]
    })
  }


}
