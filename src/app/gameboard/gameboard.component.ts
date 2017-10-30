
import { BoardDefinitionService } from '../board-definition/board-definition.service';
import { GameElement } from '../tokens/gameelement';
import { SpaceDefinitionComponent } from '../tokens/space-definition/space-definition.component';
import { SpaceDefinition } from '../board-definition/model/space-definition';
import { Component, OnInit, AfterViewInit, Input, ContentChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { PaperScope, Project, Raster, Tool, Point, ToolEvent, Layer } from 'paper';
import { SpaceCreationTool } from './tools';



/**
 * This Angular component implement the gameboard. It manage the bitmap presenting
 * the background of the board, and notif partent whith somme events.
 *
 * It use Paper library to manager display in a single canevas HTML element
 *
 */


@Component({
    selector: 'fd-gameboard',
    template: `
    <canvas id='board'></canvas>

  `,
    styles: [
        ':host { display : flex}',
        'canvas { flex : 1; height: 700px }']
})
export class GameboardComponent implements OnInit, AfterViewInit {


    @ContentChildren(SpaceDefinitionComponent)
    public boardElements: QueryList<GameElement>;

    @Output() private boardClick: EventEmitter<{ x: number, y: number }> = new EventEmitter<{ x: number, y: number }>();
    @Output() private delete = new EventEmitter();


    private scope: PaperScope;
    public board: Project;

    private moveBoardTool: Tool;

    private boardDefinitionService: BoardDefinitionService;

    constructor(boardDefinitionService: BoardDefinitionService) {
        this.boardDefinitionService = boardDefinitionService;




    }

    ngOnInit() {

    }


    ngAfterViewInit(): void {

        if (!this.scope) {
            this.scope = new PaperScope();
        }

        if (!this.board) {
            this.board = new Project('board');
            new SpaceCreationTool(this);
        } else {
            this.board.clear();
        }

        this.board.layers['background'] = new Layer();
        this.board.layers['foreground'] = new Layer();


        this.boardDefinitionService.selectedBoardImageFile.then((fileUrl) => {
            this.board.layers['background'].activate();
            const raster = new Raster(fileUrl);
            this.board.layers['foreground'].activate();
        });
    }


    public zoom(val: number) {
        this.board.view.zoom *= val;
    }




    public clicked(evt: ToolEvent) {
        if (evt.modifiers.command) {
            this.boardClick.emit({ x: evt.point.x, y: evt.point.y });
        } else {
            this.board.deselectAll();
        }
    }

    public deletePressed() {
        this.delete.emit();
    }

    public dragStart(evt: ToolEvent) {

    }

    public drag(evt: ToolEvent) {
        this.board.view.scrollBy(evt.downPoint.subtract(evt.point));
    }

    public dragStop(evt: ToolEvent) {

    }

}


