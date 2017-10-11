import { CompoundPath, Group, Point, Path, CurveLocation, Size } from 'paper';

class Link {
    public origin: SpaceDefinitionImpl;
    public target: SpaceDefinitionImpl;
}



export abstract class SpaceDefinition {

    abstract self: SpaceDefinition;

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
    abstract addLink(target: SpaceDefinition);
    abstract removeLink(target: SpaceDefinition);
    abstract remove();
}

export abstract class SpaceDefinitionDecorator extends SpaceDefinition {


    public spaceDefinition: SpaceDefinition;
    public self: SpaceDefinition;

    constructor(target: SpaceDefinition) {
        super();
        this.decorate(target);
    }

    public decorate(target: SpaceDefinition) {
        this.spaceDefinition = target;

        let item: SpaceDefinition = this;

        while (item instanceof SpaceDefinitionDecorator) {
            item.spaceDefinition.self = this;
            item = item.spaceDefinition;
        }
    }


}

export class SpaceDefinitionImpl implements SpaceDefinition {
    private static defaultOriantation: number = 0;
    public angle: number;
    public x: number;
    public y: number;
    public self: SpaceDefinition;


    public successors: SpaceDefinition[] = new Array<SpaceDefinition>();
    public predecessors: SpaceDefinition[] = new Array<SpaceDefinition>();

    // public representation: SpaceDefinitionRepresentation;

    get data(): SpaceDefinitionImpl { return this.data as SpaceDefinitionImpl; }

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.angle = SpaceDefinitionImpl.defaultOriantation;
        // this.representation = representation;
        // this.representation.setSpaceDefinition(this);

        // this.representation.drawRepresentation();
    }

    public setAngle(angle: number) {
        this.angle = angle;
        SpaceDefinitionImpl.defaultOriantation = angle;

        // this.representation.drawRepresentation();
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;

        // this.representation.drawRepresentation();
    }

    public addLink(target: SpaceDefinition) {
        this.successors.push(target);
        target.predecessors.push(this.self);

        // this.representation.drawLinks();
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



        // this.representation.drawLinks();
    }

    public remove() {


        while (this.successors.length > 0) {
            let successor = this.successors[0];
            this.removeLink(successor.self);
        }

        while (this.predecessors.length > 0) {
            let predecessor = this.predecessors[0];
            predecessor.removeLink(this.self);
            // predecessor.representation.drawLinks()
        }

        // this.representation.drawLinks()
        // this.representation.remove();
    }

}


export class SpaceDefinitionPaperRepresentation extends SpaceDefinitionDecorator {


    private representation: Group = new Group();
    private oldAngle: number = 0;
    public links: CompoundPath[] = new Array<CompoundPath>();



    public spaceDefinition: SpaceDefinition;

    public get x(): number { return this.spaceDefinition.x; }
    public set x(val: number) { this.spaceDefinition.x = val; }

    public get y(): number { return this.spaceDefinition.y; }
    public set y(val: number) { this.spaceDefinition.y = val; }

    public get angle(): number { return this.spaceDefinition.angle; }

    public get successors(): SpaceDefinition[] { return this.spaceDefinition.successors; }
    public get predecessors(): SpaceDefinition[] { return this.spaceDefinition.predecessors; }


    constructor(spaceDef: SpaceDefinition) {
        super(spaceDef);

        this.representation.name = 'space-group';
        this.representation.data = this;

        // this.oldAngle = this.angle;

        this.representation.applyMatrix = true;
        this.initRepresentation();
        this.drawRepresentation();

    }

    setAngle(angle: number) {
        this.spaceDefinition.setAngle(angle);

        this.drawRepresentation();
    }

    setPosition(x: number, y: number) {
        this.spaceDefinition.setPosition(x, y);

        this.drawRepresentation();
    }
    addLink(target: SpaceDefinition) {
        this.spaceDefinition.addLink(target);

        this.drawLinks();
    }
    removeLink(target: SpaceDefinition) {
        this.spaceDefinition.removeLink(target);

        this.drawLinks();
    }
    remove() {
        this.spaceDefinition.remove();

        for (let predecessor of this.predecessors) {
            this.getSpaceDefinitionPaperRepresentationDecorator(predecessor).drawLinks();
        }

        this.drawLinks();
        this.representation.remove();
    }

    public drawRepresentation() {
        this.representation.position = new Point(this.x, this.y);
        this.representation.rotate(this.angle - this.oldAngle);
        this.oldAngle = this.angle;

        this.drawLinks();
        for (let predecessor of this.predecessors) {
            this.getSpaceDefinitionPaperRepresentationDecorator(predecessor).drawLinks();
        }

    }

    public drawLinks() {

        // remove old links
        for (let link of this.links) {
            link.remove();
        }

        this.links.splice(0, this.links.length);

        // create new links
        for (let spaceDefSuccessor of this.successors) {
            let successor: SpaceDefinitionPaperRepresentation = this.getSpaceDefinitionPaperRepresentationDecorator(spaceDefSuccessor);
            let origin: Point = this.representation.bounds.center;
            let destination: Point = this.getLinkDestinationPoint(successor);


            let arrow = destination.subtract(origin).normalize(10);

            let link: CompoundPath = new CompoundPath([
                new Path([origin, destination]),
                new Path([destination.add(arrow.rotate(135)), destination, destination.add(arrow.rotate(-135))])
            ]);

            link.strokeColor = 'blue';
            link.strokeWidth = 3;


            link.moveBelow(this.representation);


            this.links.push(link);
        }


    }

    /**
     * return the point on the destination border to be used as destination point for the link
     */
    private getLinkDestinationPoint(dest: SpaceDefinitionPaperRepresentation): Point {

        let ret: Point = dest.representation.bounds.center;
        let origin: Point = this.representation.bounds.center;

        let line = new Path();
        line.add(new Point(origin));
        line.add(new Point(dest.representation.bounds.center));


        let intersections: CurveLocation[];

        intersections = dest.representation.children['space-body'].getIntersections(line);
        intersections = intersections.concat(dest.representation.children['space-direction'].getIntersections(line));

        line.remove();

        for (let location of intersections) {
            if (!ret || ret.subtract(origin).length > location.point.subtract(origin).length) {
                ret = location.point;
            }
        }

        return ret;
    }

    private initRepresentation() {
        let spaceBody: Path;
        spaceBody = new Path.Rectangle(new Point(0, 0), new Size(60, 30));
        spaceBody.strokeColor = 'black';
        spaceBody.fillColor = 'red';
        spaceBody.name = 'space-body';
        this.representation.addChild(spaceBody);



        let spaceDirection: Path = new Path();
        spaceDirection.add(spaceBody.bounds.topRight);
        spaceDirection.lineBy(new Point(15, 15));
        spaceDirection.add(spaceBody.bounds.bottomRight);
        spaceDirection.closePath(true);
        spaceDirection.strokeColor = 'black';
        spaceDirection.fillColor = 'green';
        spaceDirection.name = 'space-direction';
        this.representation.addChild(spaceDirection);

        let spaceHandle: Path;
        spaceHandle = new Path.Circle(this.representation.bounds.center, 5);
        spaceHandle.strokeColor = 'black';
        spaceHandle.fillColor = 'white';
        spaceHandle.name = 'space-handle';
        this.representation.addChild(spaceHandle);
    }

    private isDecorator(item: any): item is SpaceDefinitionDecorator {
        return item.spaceDefinition !== undefined;
    }

    private isSpaceDefinitionPaperRepresentation(item: any): item is SpaceDefinitionPaperRepresentation {
        return item.representation !== undefined;
    }

    private getSpaceDefinitionPaperRepresentationDecorator(item: SpaceDefinition): SpaceDefinitionPaperRepresentation {
        while (this.isDecorator(item)) {
            if (this.isSpaceDefinitionPaperRepresentation(item)) {
                return item as SpaceDefinitionPaperRepresentation;
            }

            item = item.spaceDefinition;
        }

        return undefined;
    }
}

// export class SpaceDefinitionPaperRepresentation extends Group implements SpaceDefinitionRepresentation {
//
//    public links: CompoundPath[] = new Array<CompoundPath>();
//    private oldAngle: number = 0;
//
//    constructor() {
//        super();
//        this.applyMatrix = true;
//
//        this.initRepresentation();
//
//
//    }
//
//    public setSpaceDefinition(sd: SpaceDefinitionImpl) {
//        this.data = sd;
//    }
//
//    public drawRepresentation() {
//        this.position = new Point(this.data.x, this.data.y);
//        this.rotate(this.data.angle - this.oldAngle);
//        this.oldAngle = this.data.angle;
//
//        this.drawLinks();
//        for (let predecessor of this.data.predecessors) {
//            predecessor.representation.drawLinks();
//        }
//
//    }
//
//
//
//
//    public drawLinks() {
//
//        // remove old links
//        for (let link of this.links) {
//            link.remove();
//        }
//
//        this.links.splice(0, this.links.length);
//
//        // create new links
//        for (let spaceDefSuccessor of this.data.successors) {
//            let successor: SpaceDefinitionPaperRepresentation = spaceDefSuccessor.representation;
//            let origin: Point = this.bounds.center;
//            let destination: Point = this.getLinkDestinationPoint(successor);
//
//
//            let arrow = destination.subtract(origin).normalize(10);
//
//            let link: CompoundPath = new CompoundPath([
//                new Path([origin, destination]),
//                new Path([destination.add(arrow.rotate(135)), destination, destination.add(arrow.rotate(-135))])
//            ]);
//
//            link.strokeColor = 'blue';
//            link.strokeWidth = 3;
//
//
//            link.moveBelow(this);
//
//
//            this.links.push(link);
//        }
//
//
//    }
//
//    /**
//     * return the point on the destination border to be used as destination point for the link
//     */
//    private getLinkDestinationPoint(dest: SpaceDefinitionPaperRepresentation): Point {
//
//    let ret: Point = dest.bounds.center;
//    let origin: Point = this.bounds.center;
//
//    let line = new Path();
//    line.add(new Point(origin));
//    line.add(new Point(dest.bounds.center));
//
//
//    let intersections: CurveLocation[];
//
//    intersections = dest.children['space-body'].getIntersections(line);
//    intersections = intersections.concat(dest.children['space-direction'].getIntersections(line));
//
//    line.remove();
//
//    for (let location of intersections) {
//        if (!ret || ret.subtract(origin).length > location.point.subtract(origin).length) {
//            ret = location.point;
//        }
//    }
//
//    return ret;
// }
//
//    private initRepresentation() {
//    let spaceBody: Path;
//    spaceBody = new Path.Rectangle(new Point(0, 0), new Size(60, 30));
//    spaceBody.strokeColor = 'black';
//    spaceBody.fillColor = 'red';
//    //spaceBody.strokeWidth = 5;
//    spaceBody.name = 'space-body';
//    this.addChild(spaceBody);
//
//
//
//    let spaceDirection: Path = new Path();
//    spaceDirection.add(spaceBody.bounds.topRight);
//    spaceDirection.lineBy(new Point(15, 15));
//    spaceDirection.add(spaceBody.bounds.bottomRight);
//    spaceDirection.closePath(true);
//    spaceDirection.strokeColor = 'black';
//    spaceDirection.fillColor = 'green';
//    spaceDirection.name = 'space-direction';
//    this.addChild(spaceDirection);
//
//    let spaceHandle: Path;
//    spaceHandle = new Path.Circle(this.bounds.center, 5);
//    spaceHandle.strokeColor = 'black';
//    spaceHandle.fillColor = 'white';
//    spaceHandle.name = 'space-handle';
//    this.addChild(spaceHandle);
// }
//
// }

