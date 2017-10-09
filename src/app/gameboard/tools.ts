

import { Action, MoveSpaceDefinitionAction, LinkSpaceDefinitionAction, RotateSpaceDefinitionAction, ScrollViewAction } from './actions';
import { BoardDefinitionService } from './board-definition.service';
import { SpaceDefinition, SpaceDefinitionPaperRepresentation } from './space-definition';
import { Injectable } from '@angular/core';
import { Tool, Project, ToolEvent, HitResult, Group } from 'paper';



export class SpaceCreationTool extends Tool {

    private target: Project;
    private boardDefinitionService: BoardDefinitionService;
    private isActionRunning = false;

    private action: Action;



    constructor(target: Project, boardDefinitionService: BoardDefinitionService) {
        super();
        this.target = target;
        this.boardDefinitionService = boardDefinitionService;

        this.onMouseDown = this.startAction;
        this.onMouseUp = (evt) => this.endAction(evt);
        this.onMouseMove = this.doAction;


        this.onKeyUp = (evt) => {
            switch (evt.key) {
                case 'a':
                    this.target.view.zoom *= 1.1;
                    break;
                case 'q':
                    this.target.view.zoom /= 1.1;
                    break;
                case 'delete':
                    for (let item of this.target.getItems({ selected: true, class: SpaceDefinitionPaperRepresentation })) {
                        item.data.remove();
                    }

            }
        }

    }

    public startAction(evt: ToolEvent): void {

        let hit: HitResult = this.target.hitTest(evt.point);

        if (!hit.item) return;

        switch (hit.item.name) {
            case 'space-handle':
                this.action = new MoveSpaceDefinitionAction(hit.item.parent as SpaceDefinitionPaperRepresentation);
                break;
            case 'space-body':
                if (evt.modifiers.shift) {
                    hit.item.parent.selected = true;
                } else {
                    this.action = new LinkSpaceDefinitionAction(hit.item.parent as SpaceDefinitionPaperRepresentation);
                }
                break;
            case 'space-direction':
                if (evt.modifiers.shift) {
                    hit.item.parent.selected = true;
                } else {
                    this.action = new RotateSpaceDefinitionAction(hit.item.parent as SpaceDefinitionPaperRepresentation);
                }
                break;
            default:
                if (evt.modifiers.shift) {
                    evt.item.project.deselectAll();
                } else {
                    this.action = new ScrollViewAction(this.target.view, evt.point, this.boardDefinitionService);
                }


        }

        this.isActionRunning = true;


    }

    public endAction(evt: ToolEvent) {

        if (this.action) {
            this.action.endAction(evt.point);
            this.action = undefined;
        }

        this.isActionRunning = false;
    }

    public doAction(evt: ToolEvent) {

        if (this.isActionRunning) {
            this.action.doAction(evt.point);
        }
    }
}






