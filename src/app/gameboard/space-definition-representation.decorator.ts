import { SpaceDefinitionDecorator, SpaceDefinition, SpaceDefinitionChange } from './space-definition';
import { Group, CompoundPath, Point, Path, CurveLocation, Size } from 'paper';
import { Observable } from 'rxjs';

/**
 * Decorator class to add a screen representation for a SpaceDefinition
 * This implementation use Paper library
 */

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
        this.representation.data = this.self; // TODO: potential bug - data value is not updated if new decorator are added to the chain

        this.representation.applyMatrix = true;
        this.initRepresentation();
        this.drawRepresentation();

    }

    getChangeObservable(): Observable<SpaceDefinitionChange> {
        throw new Error('Method not implemented.');
    }

    touchLink() {
        throw new Error('Method not implemented.');
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


    /**
     * Find an instance of SpaceDefinitionPaperRepresentation in the decorator chain
     *
     * @param item - any instance in a SpaceDefinition decorator chain
     * @retun the intance of SpaceDefinitionPaperRepresentation in the decorator chain of the item provided in parameter
     *
     * @throw an Error is not found
     */
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

