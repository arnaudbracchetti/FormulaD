import { BoardDefinitionService } from '../gameboard/board-definition.service';
import { GameboardComponent } from '../gameboard/gameboard.component';
import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
    selector: 'fd-board-definition',
    templateUrl: './board-definition.component.html',
    styleUrls: ['./board-definition.component.css']
})
export class BoardDefinitionComponent implements OnInit, AfterViewInit {


    @ViewChild('gameboard')
    private gameBoard: GameboardComponent;

    public boardDefinitionService: BoardDefinitionService;
    public spaceDefinitionKeys$: Observable<string[]>;

    private route: ActivatedRoute;

    constructor(route: ActivatedRoute, service: BoardDefinitionService) {
        this.route = route;
        this.boardDefinitionService = service;
        this.spaceDefinitionKeys$ = this.boardDefinitionService.getSpaceDefiniitionKeys();
    }



    ngOnInit() {
        this.route.paramMap.subscribe((param) => {
            this.boardDefinitionService.selectBoard(param.get('trackKey'));
        });
    }

    ngAfterViewInit(): void {

    }



}
