
import { BoardDefinitionService } from '../board-definition/board-definition.service';
import { GameElement } from '../tokens/gameelement';
import { SpaceDefinitionComponent } from '../tokens/space-definition/space-definition.component';
import { SpaceDefinition } from '../board-definition/model/space-definition';
import { Component, OnInit, AfterViewInit, Input, ContentChildren, QueryList, Output, EventEmitter, NgZone, AfterViewChecked, SimpleChange, SimpleChanges, OnChanges } from '@angular/core';
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
    <canvas id='board'>
    </canvas>

  `,
    styles: [
        ':host { display : flex}',
        'canvas { flex : 1; height: 700px }']
})
export class GameboardComponent implements OnInit, AfterViewInit, OnChanges {


    @ContentChildren(SpaceDefinitionComponent)
    public boardElements: QueryList<GameElement>;

    @Input() private mapFile: string;

    @Output() private boardClick: EventEmitter<{ x: number, y: number, modifiers }> = new EventEmitter<{ x: number, y: number, modifiers }>();
    @Output() private delete = new EventEmitter();



    private scope: PaperScope;
    public board: Project;

    private moveBoardTool: Tool;
    public zone: NgZone;

    private boardDefinitionService: BoardDefinitionService;

    constructor(boardDefinitionService: BoardDefinitionService, zone: NgZone) {
        this.boardDefinitionService = boardDefinitionService;
        this.zone = zone;



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


        if (this.mapFile) {
            this.board.layers['background'].activate();
            const raster = new Raster(this.mapFile);
            raster.name = 'board-map';
            this.board.layers['foreground'].activate();
        }
        /*this.boardDefinitionService.selectedBoardImageFile.then((fileUrl) => {
            this.board.layers['background'].activate();
            const raster = new Raster(fileUrl);
            raster.name = 'board-map';
            this.board.layers['foreground'].activate();
        });*/


    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.mapFile && this.board) {
            this.board.layers['background'].activate();
            const raster = new Raster(this.mapFile);
            raster.name = 'board-map';
            this.board.layers['foreground'].activate();
        }
    }

    public getSelectedTokens(): GameElement[] {
        return this.boardElements.filter((item) => item.isSelected() === true);
    }

    public zoom(val: number) {
        this.board.view.zoom *= val;
    }




    public clicked(evt: ToolEvent) {
        this.boardClick.emit({ x: evt.point.x, y: evt.point.y, modifiers: evt.modifiers });
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


