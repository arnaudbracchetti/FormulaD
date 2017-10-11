import { SpaceDefinitionImpl } from './space-definition';

export class BoardDefinition {
    public map: string;
    public spacesDefinition: SpaceDefinitionImpl[] = new Array<SpaceDefinitionImpl>();
}
