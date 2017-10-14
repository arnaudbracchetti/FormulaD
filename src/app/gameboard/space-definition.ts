import { BoardDefinitionService } from './board-definition.service';
import { CompoundPath, Group, Point, Path, CurveLocation, Size } from 'paper';
import * as firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';

//class Link {
//    public origin: SpaceDefinitionImpl;
//    public target: SpaceDefinitionImpl;
//}



export abstract class SpaceDefinition {

    abstract self: SpaceDefinition;  // reference on the begining of the decorator chain

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

    public decorate(target: SpaceDefinition) {
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

    // public representation: SpaceDefinitionRepresentation;

    //get data(): SpaceDefinition { return this.data as SpaceDefinition; }

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



    public get id(): string { return this.decorated.id; }

    public get x(): number { return this.decorated.x; }
    public set x(val: number) { this.decorated.x = val; }

    public get y(): number { return this.decorated.y; }
    public set y(val: number) { this.decorated.y = val; }

    public get angle(): number { return this.decorated.angle; }

    public get successors(): SpaceDefinition[] { return this.decorated.successors; }
    public get predecessors(): SpaceDefinition[] { return this.decorated.predecessors; }


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
        this.decorated.setAngle(angle);

        this.drawRepresentation();
    }

    setPosition(x: number, y: number) {
        this.decorated.setPosition(x, y);

        this.drawRepresentation();
    }
    addLink(target: SpaceDefinition): boolean {
        let ret = this.decorated.addLink(target);

        if (ret) {
            this.drawLinks();
        }

        return ret;
    }


    removeLink(target: SpaceDefinition) {
        this.decorated.removeLink(target);

        this.drawLinks();
    }


    remove() {
        this.decorated.remove();

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

            link.strokeColor = '#FFC300';
            link.strokeWidth = 4;


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
        spaceBody.opacity = 0.5;
        spaceBody.name = 'space-body';
        this.representation.addChild(spaceBody);



        let spaceDirection: Path = new Path();
        spaceDirection.add(spaceBody.bounds.topRight);
        spaceDirection.lineBy(new Point(15, 15));
        spaceDirection.add(spaceBody.bounds.bottomRight);
        spaceDirection.closePath(true);
        spaceDirection.strokeColor = 'black';
        spaceDirection.fillColor = 'green';
        spaceDirection.opacity = 0.5;
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
        return item.decorated !== undefined;
    }

    private isSpaceDefinitionPaperRepresentation(item: any): item is SpaceDefinitionPaperRepresentation {
        return item.representation !== undefined;
    }

    private getSpaceDefinitionPaperRepresentationDecorator(item: SpaceDefinition): SpaceDefinitionPaperRepresentation {

        item = item.self; // we start searching from the top of decorator chain

        while (this.isDecorator(item)) {
            if (this.isSpaceDefinitionPaperRepresentation(item)) {
                return item as SpaceDefinitionPaperRepresentation;
            }

            item = item.decorated;
        }

        throw (new Error('SpaceDefinitionPaperRepresentation decorator not found'));
    }
}


export class SpaceDefinitionFirebasePercitence extends SpaceDefinitionDecorator {

    public get id(): string { return this.decorated.id; }

    public get x(): number { return this.decorated.x; }
    public set x(val: number) { this.decorated.x = val; }

    public get y(): number { return this.decorated.y; }
    public set y(val: number) { this.decorated.y = val; }

    public get angle(): number { return this.decorated.angle; }

    public get successors(): SpaceDefinition[] { return this.decorated.successors; }
    public get predecessors(): SpaceDefinition[] { return this.decorated.predecessors; }


    private dbSpaceDefinitionObjectRef: firebase.database.Reference;
    private dbSpaceDefinitionLinkRef: firebase.database.Reference;
    private timeoutHandler;
    private autoSave = true;
    private boardDefinitionService: BoardDefinitionService;

    constructor(spaceDef: SpaceDefinition, dbRef: firebase.database.Reference, boardDefService: BoardDefinitionService) {
        super(spaceDef);

        this.boardDefinitionService = boardDefService;
        this.initFirebase(dbRef);


    }

    setAngle(angle: number) {
        let changed = angle !== this.angle;

        this.decorated.setAngle(angle);
        if (changed && this.autoSave) { this.save(); }

    }


    setPosition(x: number, y: number) {
        let changed = x !== this.x || y !== this.y;

        this.decorated.setPosition(x, y);
        if (changed && this.autoSave) { this.save(); }
    }


    addLink(target: SpaceDefinition) {
        let ret = this.decorated.addLink(target);


        if (this.autoSave && ret) {
            this.dbSpaceDefinitionLinkRef.child(target.id).set(true);
        }

        return ret;

    }


    removeLink(target: SpaceDefinition) {
        this.decorated.removeLink(target);

        if (this.autoSave) {
            this.dbSpaceDefinitionLinkRef.child(target.id).remove();
        }
    }


    remove() {
        this.decorated.remove();

        this.dbSpaceDefinitionObjectRef.off('value');
        this.dbSpaceDefinitionLinkRef.off('child_added');
        this.dbSpaceDefinitionLinkRef.off('child_removed');

    }

    public save() {

        clearTimeout(this.timeoutHandler);

        this.timeoutHandler = setTimeout(() =>
            this.dbSpaceDefinitionObjectRef.update(
                {
                    x: this.x,
                    y: this.y,
                    angle: this.angle
                }), 1000);

    }

    public delete() {

    }

    private initFirebase(dbRef: firebase.database.Reference) {
        this.dbSpaceDefinitionObjectRef = dbRef.child('Objects').child(this.self.id);
        this.dbSpaceDefinitionLinkRef = dbRef.child('Links').child(this.self.id);

        this.dbSpaceDefinitionObjectRef.on('value', (snapshot) => this.onValueChange(snapshot));
        this.dbSpaceDefinitionLinkRef.on('child_added', (snapshot) => this.onLinkAdded(snapshot));
        this.dbSpaceDefinitionLinkRef.on('child_removed', (snapshot) => this.onLinkRemoved(snapshot));
    }

    private onValueChange(snapshot: firebase.database.DataSnapshot) {
        let val = snapshot.val();

        if (val) {
            this.autoSave = false;
            this.self.setPosition(val.x, val.y);

            if (val.angle) {
                this.self.setAngle(val.angle);
            }

            this.autoSave = true;
        }
    }

    private onLinkAdded(snapshot: firebase.database.DataSnapshot) {
        let target = this.boardDefinitionService.getSpaceDefinitionFromId(snapshot.key);

        this.autoSave = false;
        this.self.addLink(target);
        this.autoSave = true;
    }

    private onLinkRemoved(snapshot: firebase.database.DataSnapshot) {
        let target = this.boardDefinitionService.getSpaceDefinitionFromId(snapshot.key);

        this.autoSave = false;
        this.self.removeLink(target);
        this.autoSave = true;
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

