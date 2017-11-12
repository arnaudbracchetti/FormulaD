import { SpaceDefinition } from '../../board-definition/model/space-definition';
export class Car {
    public position: SpaceDefinition;

    constructor(position: SpaceDefinition) {
        this.position = position;
    }
}


export class CarPathNode extends Car {
    private pathLength: number;
    private nextSteps: CarPathNode[];

    constructor(position: SpaceDefinition) {
        super(position);
    }
}
