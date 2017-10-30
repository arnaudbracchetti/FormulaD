import { BoardDefinitionService } from '../../board-definition/board-definition.service';
import { SpaceDefinition } from '../../board-definition/model/space-definition';
import { Action } from '../gameelement';
import { Point, View, HitResult, Path, Project } from 'paper';



/**
 * Action used to move a space definition
 */
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



/**
 * Action used to rotate a space definition
 */
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



/**
 * Action used to add link between space definition
 */
export class LinkSpaceDefinitionAction implements Action {

    private target: SpaceDefinition;
    private paperProject: Project;
    private boardDefinitionService: BoardDefinitionService;
    private link: Path;


    constructor(paperProject: Project, target: SpaceDefinition, boardDefinitionService: BoardDefinitionService) {
        this.target = target;
        this.paperProject = paperProject;
        this.boardDefinitionService = boardDefinitionService;
    }

    public doAction(point: Point) {
        if (this.link) {
            this.link.remove();
        }

        this.link = new Path([new Point(this.target.x, this.target.y), point]);
        this.link.strokeColor = 'black';

    }

    public endAction(point: Point) {
        this.link.remove();
        this.link = undefined;

        let hit: HitResult = this.paperProject.hitTest(point);

        if (hit.item.name === 'space-body') {
            let linkDestId = hit.item.parent.data;
            this.target.addLink(this.boardDefinitionService.getSpaceDefinitionFromId(linkDestId));
        }


    }
}




