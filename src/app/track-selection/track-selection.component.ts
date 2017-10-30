import { BoardDefinitionService, BoardDefinition } from '../board-definition/board-definition.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'fd-track-selection',
    templateUrl: './track-selection.component.html',
    styleUrls: ['./track-selection.component.scss']
})
export class TrackSelectionComponent implements OnInit {

    public tracks: Promise<BoardDefinition[]>;
    private boardDefinitionService: BoardDefinitionService;


    constructor(service: BoardDefinitionService) {

        this.boardDefinitionService = service;
    }

    ngOnInit() {
        this.tracks = this.boardDefinitionService.getBoardDefinitionList();
    }

}
