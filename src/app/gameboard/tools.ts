

import { Action, MoveSpaceDefinitionAction, LinkSpaceDefinitionAction, RotateSpaceDefinitionAction, ScrollViewAction } from './actions';
import { BoardDefinitionService } from './board-definition.service';
import { SpaceDefinition } from './space-definition';
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
                    for (let item of this.target.getItems({ selected: true, class: Group, name: 'space-group' })) {
                        this.boardDefinitionService.removeSpaceDefinition(item.data);
                    }

            }
        };

    }

    public startAction(evt: ToolEvent): void {

        let hit: HitResult = this.target.hitTest(evt.point);

        if (!hit || !hit.item) { return; }  // no element under mouse pointer

        switch (hit.item.name) {
            case 'space-handle':
                this.action = new MoveSpaceDefinitionAction(hit.item.parent.data as SpaceDefinition);
                break;
            case 'space-body':
                if (evt.modifiers.shift) {
                    hit.item.parent.selected = true;
                } else {
                    this.action = new LinkSpaceDefinitionAction(this.target, hit.item.parent.data as SpaceDefinition);
                }
                break;
            case 'space-direction':
                if (evt.modifiers.shift) {
                    hit.item.parent.selected = true;
                } else {
                    this.action = new RotateSpaceDefinitionAction(hit.item.parent.data as SpaceDefinition);
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







