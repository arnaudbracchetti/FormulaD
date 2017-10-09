import { CompoundPath, Group, Point, Path, CurveLocation, Size } from 'paper';

class Link {
    public origin: SpaceDefinition;
    public target: SpaceDefinition;
}

interface SpaceDefinitionRepresentation {

    remove();
    drawRepresentation();
    drawLinks();
    setSpaceDefinition(sd: SpaceDefinition);


}


export class SpaceDefinition {
    private static defaultOriantation: number = 0;
    public angle: number;
    public x: number;
    public y: number;


    public successors: SpaceDefinition[] = new Array<SpaceDefinition>();
    public predecessors: SpaceDefinition[] = new Array<SpaceDefinition>();

    public representation: SpaceDefinitionRepresentation;

    get data(): SpaceDefinition { return this.data as SpaceDefinition; }

    constructor(x: number, y: number, representation: SpaceDefinitionPaperRepresentation) {
        this.x = x;
        this.y = y;
        this.angle = SpaceDefinition.defaultOriantation;
        this.representation = representation;
        this.representation.setSpaceDefinition(this);

        this.representation.drawRepresentation();
    }

    public setAngle(angle: number) {
        this.angle = angle;
        SpaceDefinition.defaultOriantation = angle;

        this.representation.drawRepresentation();
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;

        this.representation.drawRepresentation();
    }

    public addLink(target: SpaceDefinition) {
        this.successors.push(target);
        target.predecessors.push(this);

        this.representation.drawLinks();
    }

    public removeLink(target: SpaceDefinition) {
        let index;

        // remove from presecessor list of target
        index = target.predecessors.findIndex((item) => item === this);

        if (index != -1) {
            target.predecessors.splice(index, 1);
        }

        // remove target from successor list
        index = this.successors.findIndex((item) => item === target);

        if (index != -1) {
            this.successors.splice(index, 1);
        }



        this.representation.drawLinks();
    }

    public remove() {


        while (this.successors.length > 0) {
            let successor = this.successors[0];
            this.removeLink(successor);
        }

        while (this.predecessors.length > 0) {
            let predecessor = this.predecessors[0];
            predecessor.removeLink(this);
            predecessor.representation.drawLinks()
        }

        this.representation.drawLinks()
        this.representation.remove();
    }

}

export class SpaceDefinitionPaperRepresentation extends Group implements SpaceDefinitionRepresentation {

    public links: CompoundPath[] = new Array<CompoundPath>();
    private oldAngle: number = 0;

    constructor() {
        super();
        this.applyMatrix = true;

        this.initRepresentation();


    }

    public setSpaceDefinition(sd: SpaceDefinition) {
        this.data = sd;
    }

    public drawRepresentation() {
        this.position = new Point(this.data.x, this.data.y);
        this.rotate(this.data.angle - this.oldAngle);
        this.oldAngle = this.data.angle;

        this.drawLinks();
        for (let predecessor of this.data.predecessors) {
            predecessor.representation.drawLinks();
        }

    }




    public drawLinks() {

        // remove old links
        for (let link of this.links) {
            link.remove();
        }

        this.links.splice(0, this.links.length);

        // create new links
        for (let spaceDefSuccessor of this.data.successors) {
            let successor: SpaceDefinitionPaperRepresentation = spaceDefSuccessor.representation;
            let origin: Point = this.bounds.center;
            let destination: Point = this.getLinkDestinationPoint(successor);


            let arrow = destination.subtract(origin).normalize(10);

            let link: CompoundPath = new CompoundPath([
                new Path([origin, destination]),
                new Path([destination.add(arrow.rotate(135)), destination, destination.add(arrow.rotate(-135))])
            ]);

            link.strokeColor = 'blue';
            link.strokeWidth = 3;


            link.moveBelow(this);


            this.links.push(link);
        }


    }

    /**
     * return the point on the destination border to be used as destination point for the link
     */
    private getLinkDestinationPoint(dest: SpaceDefinitionPaperRepresentation): Point {

        let ret: Point = dest.bounds.center;
        let origin: Point = this.bounds.center;

        let line = new Path();
        line.add(new Point(origin));
        line.add(new Point(dest.bounds.center));


        let intersections: CurveLocation[];

        intersections = dest.children['space-body'].getIntersections(line);
        intersections = intersections.concat(dest.children['space-direction'].getIntersections(line));

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
        //spaceBody.strokeWidth = 5;
        spaceBody.name = 'space-body';
        this.addChild(spaceBody);



        let spaceDirection: Path = new Path();
        spaceDirection.add(spaceBody.bounds.topRight);
        spaceDirection.lineBy(new Point(15, 15));
        spaceDirection.add(spaceBody.bounds.bottomRight);
        spaceDirection.closePath(true);
        spaceDirection.strokeColor = 'black';
        spaceDirection.fillColor = 'green';
        spaceDirection.name = 'space-direction';
        this.addChild(spaceDirection);

        let spaceHandle: Path;
        spaceHandle = new Path.Circle(this.bounds.center, 5);
        spaceHandle.strokeColor = 'black';
        spaceHandle.fillColor = 'white';
        spaceHandle.name = 'space-handle';
        this.addChild(spaceHandle);
    }

}