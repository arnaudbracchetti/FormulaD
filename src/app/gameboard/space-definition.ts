
/**
 * Class SpaceDefinition
 * This class represent the decription of all data associated with each borad game spaces.
 * In FormulaD a space is a location where a car can take place (position, curve or strait line, ...).
 * With the help of this class we can transform the bitmap image of the board into a data sctructure
 * we can use to implement the game rules, place cars, and so on.
 *
 * Implementation of SpaceDefinition work as a decorator chain {@link xxxxx} to be able to add
 * compotrement to the base class depending on the context. for instance, SpaceDefinition
 * must have a screen representation when we are in configuration mode, but not in normal
 * game mode.
 */




export abstract class SpaceDefinition {

    /** reference on the begining of the decorator chain */
    abstract self: SpaceDefinition;

    abstract id: string;
    abstract angle: number;
    abstract x: number;
    abstract y: number;
    abstract predecessors: SpaceDefinition[];
    abstract successors: SpaceDefinition[];

    constructor() {
        this.self = this;
    }

    abstract setAngle(angle: number);
    abstract setPosition(x: number, y: number);
    abstract addLink(target: SpaceDefinition): boolean;
    abstract removeLink(target: SpaceDefinition);
    abstract remove();
}

export abstract class SpaceDefinitionDecorator extends SpaceDefinition {


    public decorated: SpaceDefinition;
    public self: SpaceDefinition;

    constructor(target: SpaceDefinition) {
        super();
        this.decorate(target);
    }

    /**
     * Initialize Decorator. This method set the decorator chain and ensure that
     * self {@link SpaceDefinition#self} attribute is set to the new top of the chain for all item in the
     * decorator chain.
     */
    private decorate(target: SpaceDefinition) {
        this.decorated = target;

        let item: SpaceDefinition = this;

        while (item instanceof SpaceDefinitionDecorator) {
            item.decorated.self = this;
            item = item.decorated;
        }
    }


}






export class SpaceDefinitionImpl extends SpaceDefinition {
    private static defaultOriantation: number = 0;

    public id: string;
    public angle: number;
    public x: number;
    public y: number;
    public self: SpaceDefinition;


    public successors: SpaceDefinition[] = new Array<SpaceDefinition>();
    public predecessors: SpaceDefinition[] = new Array<SpaceDefinition>();



    constructor(id: string, x: number, y: number, angle?: number) {
        super();

        this.id = id;
        this.x = x;
        this.y = y;

        if (angle) {
            this.angle = angle;
        } else {
            this.angle = SpaceDefinitionImpl.defaultOriantation;
        }
    }

    public setAngle(angle: number) {
        this.angle = angle;
        SpaceDefinitionImpl.defaultOriantation = angle;
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;

    }

    public addLink(target: SpaceDefinition): boolean {

        if (this.successors.includes(target.self) || target.self === this.self) {
            // can't link same SpaceDefintion twice
            // can't link SpaceDefinition with itself
            return false;
        }

        this.successors.push(target);
        target.predecessors.push(this.self);

        return true;
    }

    public removeLink(target: SpaceDefinition) {
        let index;

        // remove from presecessor list of target
        index = target.predecessors.findIndex((item) => item === this.self);

        if (index !== -1) {
            target.predecessors.splice(index, 1);
        }

        // remove target from successor list
        index = this.successors.findIndex((item) => item === target);

        if (index !== -1) {
            this.successors.splice(index, 1);
        }

    }

    public remove() {

        while (this.successors.length > 0) {
            let successor = this.successors[0];
            this.removeLink(successor.self);
        }

        while (this.predecessors.length > 0) {
            let predecessor = this.predecessors[0];
            predecessor.removeLink(this.self);
        }
    }

}





