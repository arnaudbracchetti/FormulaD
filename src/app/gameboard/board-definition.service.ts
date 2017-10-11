import { BoardDefinition } from './board-definition';
import { SpaceDefinitionImpl, SpaceDefinitionPaperRepresentation, SpaceDefinition } from './space-definition';
import { Injectable } from '@angular/core';

@Injectable()
export class BoardDefinitionService {

    public boardDefinition: BoardDefinition;

    constructor() { }

    public saveBoardDefinition(name: string) {

    }

    public createSpaceDefinition(x: number, y: number): SpaceDefinition {
        let spaceDef: SpaceDefinition = new SpaceDefinitionImpl(x, y);
        spaceDef = new SpaceDefinitionPaperRepresentation(spaceDef);

        return spaceDef;
    }

}
