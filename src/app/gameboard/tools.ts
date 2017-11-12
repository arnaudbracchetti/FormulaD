

import { GameElement } from '../tokens/gameelement';
import { BoardDefinitionService } from '../board-definition/board-definition.service';
import { GameboardComponent } from './gameboard.component';
import { SpaceDefinition } from '../board-definition/model/space-definition';
import { QueryList } from '@angular/core';
import { Tool, Project, ToolEvent, HitResult, Group } from 'paper';



export class SpaceCreationTool extends Tool {

    private board: GameboardComponent;
    private pointedItem: GameElement;
    private isDragRunning = false;

    constructor(board: GameboardComponent) {
        super();
        this.board = board;

        this.onMouseDown = (evt) => board.zone.run(() => this.mouseDown(evt));
        this.onMouseUp = (evt) => board.zone.run(() => this.mouseUp(evt));
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


        if (evt.item.name === 'board-map') {
            this.pointedItem = undefined;
        } else if (evt.item.data) {
            this.pointedItem = this.board.boardElements.find((sdToken) => sdToken.id === evt.item.data);
        }

    }

    public mouseUp(evt: ToolEvent): void {


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







