import { BoardDefinitionService } from './board-definition.service';
import { SpaceDefinition, SpaceDefinitionPaperRepresentation } from './space-definition';
import { Point, View, HitResult, Path } from 'paper';


export interface Action {
    doAction(point: Point);
    endAction(point: Point);
}

export class MoveSpaceDefinitionAction implements Action {

    private target: SpaceDefinitionPaperRepresentation;

    constructor(target: SpaceDefinitionPaperRepresentation) {
        this.target = target;
    }

    public doAction(point: Point) {
        this.target.data.setPosition(point.x, point.y);
    }

    public endAction(point: Point) { }
}

export class RotateSpaceDefinitionAction implements Action {

    private target: SpaceDefinitionPaperRepresentation;

    constructor(target: SpaceDefinitionPaperRepresentation) {
        this.target = target;
    }

    public doAction(point: Point) {
        this.target.data.setAngle(point.subtract(this.target.bounds.center).angle);
    }

    public endAction(point: Point) { }
}

export class LinkSpaceDefinitionAction implements Action {

    private target: SpaceDefinitionPaperRepresentation;
    private link: Path;


    constructor(target: SpaceDefinitionPaperRepresentation) {
        this.target = target;
    }

    public doAction(point: Point) {
        this.link = new Path([this.target.bounds.center, point])
        this.link.removeOnMove();
        this.link.removeOnUp();
        this.link.strokeColor = 'black';

    }

    public endAction(point: Point) {
        let hit: HitResult = this.target.project.hitTest(point);

        if (hit.item.name == 'space-body') {
            this.target.data.addLink(hit.item.parent.data as SpaceDefinition);
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

