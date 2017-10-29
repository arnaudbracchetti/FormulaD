import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceDefinitionComponent } from './space-definition.component';

describe('SpaceDefinitionComponent', () => {
  let component: SpaceDefinitionComponent;
  let fixture: ComponentFixture<SpaceDefinitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpaceDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpaceDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
