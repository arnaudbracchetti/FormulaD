import { GameboardComponent } from '../gameboard/gameboard.component';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'fd-board-definition',
    templateUrl: './board-definition.component.html',
    styleUrls: ['./board-definition.component.css']
})
export class BoardDefinitionComponent implements OnInit {

    @ViewChild('gameboard')
    private gameBoard: GameboardComponent;

    constructor() { }

    ngOnInit() {
    }

    setMoveAndZoomTool() {
        this.gameBoard.setMoveAndZoomTool();
    }

    setDefineSpaceTool() {
        //  this.gameBoard.setDefineSpaceTool();
    }

}
