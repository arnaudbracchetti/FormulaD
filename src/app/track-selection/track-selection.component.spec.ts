import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CircuitSelectionComponent } from './circuit-selection.component';

describe('CircuitSelectionComponent', () => {
  let component: CircuitSelectionComponent;
  let fixture: ComponentFixture<CircuitSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CircuitSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CircuitSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
