import { BoardDefinitionService } from './board-definition.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PaperScope, Project, Raster, Tool, Point, ToolEvent, Layer } from 'paper';
import { SpaceCreationTool } from './tools';






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

        this.scope = new PaperScope();
        this.board = new Project('board');

        new SpaceCreationTool(this.board, this.boardDefinitionService);
        // const raster = new Raster('../assets/rl02_Alsace.jpg');
        const raster = new Raster('../assets/rl02_Alsace.jpg');

        new Layer();


        this.board.view.draw();
    }

    public setMoveAndZoomTool() {
        new SpaceCreationTool(this.board, this.boardDefinitionService).activate();
    }


}


