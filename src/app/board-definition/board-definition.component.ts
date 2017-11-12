import { BoardDefinitionService } from './board-definition.service';
import { GameElement } from '../tokens/gameelement';
import { SpaceDefinitionComponent } from '../tokens/space-definition/space-definition.component';
import { SpaceDefinition } from './model/space-definition';
import { Component, OnInit, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
    selector: 'fd-board-definition',
    templateUrl: './board-definition.component.html',
    styleUrls: ['./board-definition.component.css']
})
export class BoardDefinitionComponent implements OnInit, AfterViewInit {

    @ViewChildren(SpaceDefinitionComponent)
    private spaceDefinitionComponents: QueryList<SpaceDefinitionComponent>;

    public boardDefinitionService: BoardDefinitionService;
    public spaceDefinitions$: Observable<SpaceDefinition[]>;

    private route: ActivatedRoute;
    private showDialog = false;
    public mapFile: string;

    constructor(route: ActivatedRoute, service: BoardDefinitionService) {
        this.route = route;
        this.boardDefinitionService = service;
        this.spaceDefinitions$ = this.boardDefinitionService.getSpaceDefinitions();
    }



    ngOnInit() {
        this.route.paramMap.subscribe((param) => {
            this.boardDefinitionService.selectBoard(param.get('trackKey')).then(
                () => this.mapFile = this.boardDefinitionService.selectedBoardImageFile
            );
        });
    }

    ngAfterViewInit(): void {

    }


    public getSelectedSpaceDefinition(): SpaceDefinition[] {
        if (this.spaceDefinitionComponents) {
            return this.spaceDefinitionComponents.filter((item) => item.isSelected()).map((item) => item.data);
        } else {
            return [];
        }

    }

    public removeSelectedElements() {
        let selectedElements: GameElement[] = this.spaceDefinitionComponents.filter((item) => item.isSelected());

        this.deselectAllTokens();

        for (let item of selectedElements) {
            this.boardDefinitionService.removeSpaceDefinitionById(item.id);
        }

        this.selectionChange();
    }

    public deselectAllTokens() {
        this.spaceDefinitionComponents.filter((item) => item.isSelected()).forEach((item) => item.toggleSelect());
        this.selectionChange();
    }

    public selectionChange() {

        if (this.getSelectedSpaceDefinition().length === 1) {
            this.showDialog = true;
        } else {
            this.showDialog = false;
        }

    }

    public onTokenClicked(token: GameElement) {
        this.deselectAllTokens(); // only one spaceDefinition selected at a time
        token.toggleSelect();
        this.selectionChange();
    }

    public onBoardClicked(evt) {
        if (evt.modifiers.command) { // create new space definition if ctrl/cmd key is pressed
            this.boardDefinitionService.addNewSpaceDefinition(evt.x, evt.y);
        } else {
            this.deselectAllTokens();

        }
    }
}
