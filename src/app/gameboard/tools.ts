

import { GameElement } from '../tokens/gameelement';
//import { Action, MoveSpaceDefinitionAction, LinkSpaceDefinitionAction, RotateSpaceDefinitionAction, ScrollViewAction } from '../tokens/space-definition/actions';
import { BoardDefinitionService } from '../board-definition/board-definition.service';
import { GameboardComponent } from './gameboard.component';
import { SpaceDefinition } from '../board-definition/model/space-definition';
import { QueryList } from '@angular/core';
import { Tool, Project, ToolEvent, HitResult, Group } from 'paper';



export class SpaceCreationTool extends Tool {

    private board: GameboardComponent;
    private gameElements: QueryList<GameElement>;
    private pointedItem: GameElement;
    private isDragRunning = false;

    constructor(board: GameboardComponent) {
        super();
        this.board = board;
        this.gameElements = board.boardElements;

        this.onMouseDown = (evt) => this.mouseDown(evt);
        this.onMouseUp = (evt) => this.mouseUp(evt);
        this.onMouseMove = (evt) => this.mouseMove(evt);
        this.onMouseDrag = (evt) => this.mouseDrag(evt);


        this.onKeyUp = (evt) => {
            switch (evt.key) {
                case 'a':
                    this.board.zoom(1.1);
                    break;
                case 'q':
                    this.board.zoom(0.9);
                    break;
                case 'delete':
                    this.board.deletePressed();


            }
        };

    }



    public mouseDown(evt: ToolEvent): void {


        if (evt.item.data) {  //TODO: A revoir pour une prise en compte correct du click sur fond de carte
            this.pointedItem = this.board.boardElements.find((item) => item.id === evt.item.data);
        } else {
            this.pointedItem = undefined;
        }


    }

    public mouseUp(evt: ToolEvent): void {

        // let dist = evt.downPoint.subtract(evt.point).length;

        if (!this.isDragRunning) {
            if (this.pointedItem) {
                this.pointedItem.clicked(evt);
                this.pointedItem = undefined;
            } else {
                this.board.clicked(evt);
            }
        } else {
            if (this.pointedItem) {
                this.pointedItem.dragStop(evt);
                this.pointedItem = undefined;
                this.isDragRunning = false;
            } else {
                this.board.dragStop(evt);
                this.isDragRunning = false;
            }
        }


    }

    public mouseMove(evt: ToolEvent): void {


    }

    public mouseDrag(evt: ToolEvent): void {
        if (this.pointedItem) {
            if (this.isDragRunning) {
                this.pointedItem.drag(evt);
            } else {
                this.pointedItem.dragStart(evt);
                this.isDragRunning = true;
            }
        } else {
            if (this.isDragRunning) {
                this.board.drag(evt);
            } else {
                this.board.dragStart(evt);
                this.isDragRunning = true;
            }
        }

    }
}







