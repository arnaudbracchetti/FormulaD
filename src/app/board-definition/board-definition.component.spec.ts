import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardDefinitionComponent } from './board-definition.component';

describe('BoardDefinitionComponent', () => {
    let component: BoardDefinitionComponent;
    let fixture: ComponentFixture<BoardDefinitionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BoardDefinitionComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BoardDefinitionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    describe('Set tools', () => {
        it('should set MoveAndZoomTool', () => {
            component.ngOnInitsetMoveAnsZoomTool();

            expect(component.getTool()).to

        });
    });
});
