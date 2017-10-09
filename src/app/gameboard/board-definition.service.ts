import { BoardDefinition } from './board-definition';
import { SpaceDefinition, SpaceDefinitionPaperRepresentation } from './space-definition';
import { Injectable } from '@angular/core';

@Injectable()
export class BoardDefinitionService {

    public boardDefinition: BoardDefinition;

    constructor() { }

    public saveBoardDefinition(name: string) {

    }

    public createSpaceDefinition(x: number, y: number): SpaceDefinition {
        return new SpaceDefinition(x, y, new SpaceDefinitionPaperRepresentation());
    }

}
