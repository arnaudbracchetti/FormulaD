import { BoardDefinitionService } from './board-definition.service';
import { SpaceDefinitionImpl, SpaceDefinitionPaperRepresentation, SpaceDefinition } from './space-definition';
import { Point, View, HitResult, Path, Project } from 'paper';


export interface Action {
    doAction(point: Point);
    endAction(point: Point);
}

export class MoveSpaceDefinitionAction implements Action {

    private target: SpaceDefinition;

    constructor(target: SpaceDefinition) {
        this.target = target;
    }

    public doAction(point: Point) {
        this.target.setPosition(point.x, point.y);
    }

    public endAction(point: Point) { }
}

export class RotateSpaceDefinitionAction implements Action {

    private target: SpaceDefinition;

    constructor(target: SpaceDefinition) {
        this.target = target;
    }

    public doAction(point: Point) {
        this.target.setAngle(point.subtract(new Point(this.target.x, this.target.y)).angle);
    }

    public endAction(point: Point) { }
}

export class LinkSpaceDefinitionAction implements Action {

    private target: SpaceDefinition;
    private paperProject: Project;
    private link: Path;


    constructor(paperProject: Project, target: SpaceDefinition) {
        this.target = target;
        this.paperProject = paperProject;
    }

    public doAction(point: Point) {
        this.link = new Path([new Point(this.target.x, this.target.y), point]);
        this.link.removeOnMove();
        this.link.removeOnUp();
        this.link.strokeColor = 'black';

    }

    public endAction(point: Point) {
        let hit: HitResult = this.paperProject.hitTest(point);

        if (hit.item.name === 'space-body') {
            this.target.addLink(hit.item.parent.data as SpaceDefinitionImpl);
        }
    }
}


export class ScrollViewAction implements Action {

    private isScrolled = false;
    private target: View;
    private boardDefinitionService: BoardDefinitionService;
    private startingPoint: Point;

    constructor(target: View, startingPoint: Point, boardDefinitionService: BoardDefinitionService) {
        this.target = target;
        this.boardDefinitionService = boardDefinitionService;
        this.startingPoint = startingPoint;
    }

    public doAction(point: Point) {
        this.target.scrollBy(this.startingPoint.subtract(point));
        this.isScrolled = true;
    }

    public endAction(point: Point) {
        if (!this.isScrolled) {
            this.boardDefinitionService.createSpaceDefinition(point.x, point.y);
        }

    }

}

