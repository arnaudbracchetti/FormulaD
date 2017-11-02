
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



import { Subject, Observable } from 'rxjs';
export interface SpaceDefinitionChange {
    id: string;
    type: string;
}

export abstract class SpaceDefinition {

    /** reference on the begining of the decorator chain */
    abstract self: SpaceDefinition;

    abstract id: string;
    abstract angle: number;
    abstract x: number;
    abstract y: number;
    abstract predecessors: SpaceDefinition[];
    abstract successors: SpaceDefinition[];
    abstract isStartPosition: boolean;

    constructor() {
        this.self = this;
    }

    abstract setAngle(angle: number);
    abstract setPosition(x: number, y: number);
    abstract addLink(target: SpaceDefinition): boolean;
    abstract removeLink(target: SpaceDefinition);
    abstract touchLink();
    abstract remove();
    abstract straightLink(): SpaceDefinition;
    abstract leftLink(): SpaceDefinition;
    abstract rightLink(): SpaceDefinition;

    abstract getChangeObservable(): Observable<SpaceDefinitionChange>;
    abstract computeLinkOriantation();
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
    public isStartPosition: boolean;
    public self: SpaceDefinition;


    public successors: SpaceDefinition[] = new Array<SpaceDefinition>();
    public predecessors: SpaceDefinition[] = new Array<SpaceDefinition>();

    private changeSubject$: Subject<SpaceDefinitionChange> = new Subject<SpaceDefinitionChange>();
    private straightIndex: number;
    private leftIndex: number;
    private rightIndex: number;

    constructor(id: string, x: number, y: number, angle?: number, isStartPosition?: boolean) {
        super();

        this.id = id;
        this.x = x;
        this.y = y;

        if (angle) {
            this.angle = angle;
        } else {
            this.angle = SpaceDefinitionImpl.defaultOriantation;
        }

        if (isStartPosition) {
            this.isStartPosition = isStartPosition;
        } else {
            this.isStartPosition = false;
        }

        this.computeLinkOriantation();
    }


    /**
     * returns an Observable that notifies each change to the current instance of SpaceDefinition
     */
    public getChangeObservable(): Observable<SpaceDefinitionChange> {
        return this.changeSubject$.asObservable();
    }



    public setAngle(angle: number) {
        this.angle = angle;
        SpaceDefinitionImpl.defaultOriantation = angle;
        this.computeLinkOriantation();

        this.changeSubject$.next({ type: 'angle', id: this.id });
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;

        this.computeLinkOriantation();

        this.predecessors.forEach((item) => { item.computeLinkOriantation(); });

        this.changeSubject$.next({ type: 'position', id: this.id });

    }

    public addLink(target: SpaceDefinition): boolean {


        if (this.successors.includes(target.self) || target.self === this.self) {
            // can't link same SpaceDefintion twice
            // can't link SpaceDefinition with itself
            return false;
        }

        if (this.successors.length === 3) { // we can't have more than 3 link
            this.removeLink(this.successors[0]);
        }

        this.successors.push(target.self);
        target.predecessors.push(this.self);

        this.computeLinkOriantation();

        this.changeSubject$.next({ type: 'links', id: this.id });

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

        this.computeLinkOriantation();
        this.changeSubject$.next({ type: 'links', id: this.id });

    }

    public straightLink(): SpaceDefinition {
        if (this.straightIndex !== undefined) {
            return this.successors[this.straightIndex];
        } else {
            return undefined;
        }

    }

    public leftLink(): SpaceDefinition {
        if (this.leftIndex !== undefined) {
            return this.successors[this.leftIndex];
        } else {
            return undefined;
        }
    }

    public rightLink(): SpaceDefinition {
        if (this.rightIndex !== undefined) {
            return this.successors[this.rightIndex];
        } else {
            return undefined;
        }
    }



    /**
     * Notify observer for a virtual link change.
     * Used to force some actions like redrawing link in spacedefinition representation.
     */
    public touchLink() {
        this.changeSubject$.next({ type: 'links', id: this.id });
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



    /**
     * return the successor index for the link maching the straight path.
     * The straight path is the link making the smaller angle with the space oriantation.
     *
     * This method use scalar product of 2 verctors to determine cos of the angle.
     * V1xV2 = |V1|x|V2| x cos(V1V2)
     *
     * link with the higher cos is the straight link.
     *
     * @return numnber : index of straight link in the successor array. undefined if the array is empty.
     */
    private getStraightLinkIndex(): number {
        let cos: number[];

        if (this.successors.length === 0) {  // no successor link
            return undefined;
        }

        // coordinates of the normal verctor with the spaceDefinition oriantation
        let x1 = Math.cos(this.angle / 180 * Math.PI);
        let y1 = Math.sin(this.angle / 180 * Math.PI);
        //spacenorm = 1;

        cos = this.successors.map((item) => {


            let x2 = item.x - this.x;
            let y2 = item.y - this.y;
            let linknorm = Math.sqrt(x2 * x2 + y2 * y2);

            return (x1 * x2 + y1 * y2) / linknorm;  // cos of the angle between spaceDefinition oriantation and the current link
        });

        // find higher cos index
        let ret = 0;
        let retCos = cos[0];

        for (let i = 1; i < this.successors.length; i++) {
            if (cos[i] > retCos) {
                ret = i;
                retCos = cos[i];
            }
        }

        return ret;

    }


    /**
     * Compute and set privates attributes straightIndex, leftInex, rightIndex
     * this methode use getStraightLinkIndex to get the straight index, then it try to determine
     * if other links are to the right or to left of this link.
     *
     * we use vectorial product sign for this.
     * V1^V2 > 0 : V2 is on the left of V1
     * V1^V2 < 0 : V2 is on the right of V1
     */
    public computeLinkOriantation() {
        this.straightIndex = this.getStraightLinkIndex();  // identify straight index
        this.rightIndex = undefined;
        this.leftIndex = undefined;

        if (this.straightIndex !== undefined) {

            // straight vector coordinates
            let x1 = this.straightLink().x - this.x;
            let y1 = this.straightLink().y - this.y;
            //spacenorm = 1;

            for (let i = 0; i < this.successors.length; i++) {
                if (i !== this.straightIndex) {

                    // current vector coordinates
                    let x2 = this.successors[i].x - this.x;
                    let y2 = this.successors[i].y - this.y;

                    // vectorial product
                    let product = x1 * y2 - x2 * y1;

                    // set the correct attribute according to the sign of the product
                    if (product > 0) {
                        this.leftIndex = i;
                    } else {
                        this.rightIndex = i;
                    }

                }
            }
        }
    }



}





