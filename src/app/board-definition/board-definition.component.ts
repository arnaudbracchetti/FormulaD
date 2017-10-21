import { BoardDefinitionService } from '../gameboard/board-definition.service';
import { GameboardComponent } from '../gameboard/gameboard.component';
import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
    selector: 'fd-board-definition',
    templateUrl: './board-definition.component.html',
    styleUrls: ['./board-definition.component.css']
})
export class BoardDefinitionComponent implements OnInit, AfterViewInit {


    @ViewChild('gameboard')
    private gameBoard: GameboardComponent;

    public boardDefinitionService: BoardDefinitionService;

    private route: ActivatedRoute;

    constructor(route: ActivatedRoute, service: BoardDefinitionService) {
        this.route = route;
        this.boardDefinitionService = service;
    }



    ngOnInit() {
        this.route.paramMap.subscribe((param) => {
            this.boardDefinitionService.selectBoard(param.get('trackKey'));
        });
    }

    ngAfterViewInit(): void {

    }

    setMoveAndZoomTool() {
        this.gameBoard.setMoveAndZoomTool();
    }


}
