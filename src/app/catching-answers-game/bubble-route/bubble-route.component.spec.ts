import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BubbleRouteComponent } from './bubble-route.component';

describe('BubbleRouteComponent', () => {
  let component: BubbleRouteComponent;
  let fixture: ComponentFixture<BubbleRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BubbleRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BubbleRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
