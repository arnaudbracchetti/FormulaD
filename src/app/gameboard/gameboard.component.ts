import { BoardDefinitionService } from './board-definition.service';
import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { PaperScope, Project, Raster, Tool, Point, ToolEvent, Layer } from 'paper';
import { SpaceCreationTool } from './tools';



/**
 * This Angular component implement the gameboard. It manage the bitmap presenting
 * the background of the board, and SpaceDefinition.
 *
 * It use Paper library to manager display in a single canevas HTML element
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
            new SpaceCreationTool(this.board, this.boardDefinitionService);
        } else {
            this.board.clear();
        }

        this.board.layers['background'] = new Layer();
        this.board.layers['foreground'] = new Layer();


        this.boardDefinitionService.selectedBoardImageFile.then((fileUrl) => {
            this.board.layers['background'].activate();
            const raster = new Raster(fileUrl);
            this.board.layers['foreground'].activate();


            //this.board.view.draw();

        });
    }

    public setMoveAndZoomTool() {
        new SpaceCreationTool(this.board, this.boardDefinitionService).activate();
    }


}


