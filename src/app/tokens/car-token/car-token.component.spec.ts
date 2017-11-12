import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarTokenComponent } from './car-token.component';

describe('CarTokenComponent', () => {
  let component: CarTokenComponent;
  let fixture: ComponentFixture<CarTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
