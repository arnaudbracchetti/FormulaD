import { EventEmitter, Output, NgZone } from '@angular/core';
import { ToolEvent, Point } from 'paper';

export abstract class GameElement {
    public abstract id: string;
    private action: Action;
    private zone: NgZone;

    @Output() tokenClicked: EventEmitter<GameElement> = new EventEmitter<GameElement>();

    constructor(zone: NgZone) {
        this.zone = zone;
    }

    public clicked(evt: ToolEvent) {
        this.tokenClicked.emit(this);

    }


    public dragStart(evt: ToolEvent) {
        this.action = this.getAction(evt);

        if (this.action && this.action.startAction) {
            this.action.startAction(evt.point);

        }
    }


    public drag(evt: ToolEvent) {
        if (this.action) {
            this.action.doAction(evt.point);
        }
    }

    public dragStop(evt: ToolEvent) {
        if (this.action && this.action.endAction) {
            this.action.endAction(evt.point);
        }

        this.action = undefined;
    }

    public abstract isSelected(): boolean;
    public abstract toggleSelect();
    public abstract getAction(evt: ToolEvent): Action;
}


export interface Action {
    startAction?(point: Point);
    doAction(point: Point);
    endAction?(point: Point);
}

