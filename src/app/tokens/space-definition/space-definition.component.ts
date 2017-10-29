import { BoardDefinitionService } from '../../gameboard/board-definition.service';
import { SpaceDefinition, SpaceDefinitionChange } from '../../gameboard/space-definition';
import { GameElement, Action } from '../gameelement';
import { MoveSpaceDefinitionAction, RotateSpaceDefinitionAction, LinkSpaceDefinitionAction } from './actions';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Group, CompoundPath, Point, Size, Path, ToolEvent, HitResult, CurveLocation } from 'paper';
import { Observable, Subscription } from 'rxjs';






@Component({
    selector: 'fd-space-definition',
    template: '',
})
export class SpaceDefinitionComponent extends GameElement implements OnInit, OnDestroy {


    @Input()
    public readonly id: string;

    private boardDefinitionService: BoardDefinitionService;
    private representation: Group = new Group();
    private oldAngle: number = 0;
    private data: SpaceDefinition;
    private change$: Observable<SpaceDefinitionChange>;
    private changeSubscription: Subscription;


    public links: CompoundPath[] = new Array<CompoundPath>();

    get x(): number { return this.data.x; }
    get y(): number { return this.data.y; }
    get angle(): number { return this.data.angle; }



    constructor(service: BoardDefinitionService) {
        super();
        this.boardDefinitionService = service;

        this.representation.name = 'space-group';
        this.representation.applyMatrix = true;

    }

    ngOnInit() {
        this.data = this.boardDefinitionService.getSpaceDefinitionFromId(this.id);

        // suscribe to data modification
        this.change$ = this.data.getChangeObservable();
        this.changeSubscription = this.change$.subscribe(() => this.onDataChange());

        // init view
        this.representation.data = this.id;
        this.initRepresentation();
        this.drawRepresentation();
    }

    ngOnDestroy(): void {
        this.representation.remove();
        this.changeSubscription.unsubscribe();

    }

    public onDataChange() {
        this.drawRepresentation();
    }

    clicked(evt: ToolEvent): void {
        this.representation.selected = !this.representation.selected;
    }

    public getAction(evt: ToolEvent): Action {
        let hit: HitResult = this.representation.hitTest(evt.point, { fill: true });
        if (hit) {
            switch (hit.item.name) {
                case 'space-handle':
                    return new MoveSpaceDefinitionAction(this.data);
                case 'space-direction':
                    return new RotateSpaceDefinitionAction(this.data);
                case 'space-body':
                    return new LinkSpaceDefinitionAction(this.representation.project, this.data, this.boardDefinitionService);
            }
        }

        return new MoveSpaceDefinitionAction(this.data);
    }


    isSelected(): boolean {
        return this.representation.selected;
    }



    public drawRepresentation() {

        // draw body
        this.representation.position = new Point(this.x, this.y);
        this.representation.rotate(this.angle - this.oldAngle);
        this.oldAngle = this.angle;

        // draw links
        this.drawLinks();
        for (let predecessor of this.data.predecessors) {
            predecessor.touchLink();
        }


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

    public drawLinks() {

        // remove old links
        for (let link of this.links) {
            link.remove();
        }

        this.links.splice(0, this.links.length);

        // create new links
        for (let successor of this.data.successors) {
            // let successor: SpaceDefinitionPaperRepresentation = this.getSpaceDefinitionPaperRepresentationDecorator(spaceDefSuccessor);
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
    private getLinkDestinationPoint(dest: SpaceDefinition): Point {

        let ret: Point = new Point(dest.x, dest.y);
        let origin: Point = this.representation.bounds.center;
        let destRepresentation = this.representation.project.getItem({ name: 'space-group', data: dest.id });

        if (!destRepresentation) {
            throw (new Error('getLinkDestinationPoint : No representation found for destination'));
        }

        let line = new Path();
        line.add(origin);
        line.add(ret);


        let intersections: CurveLocation[];

        intersections = destRepresentation.children['space-body'].getIntersections(line);
        intersections = intersections.concat(destRepresentation.children['space-direction'].getIntersections(line));

        line.remove();

        for (let location of intersections) {
            if (!ret || ret.subtract(origin).length > location.point.subtract(origin).length) {
                ret = location.point;
            }
        }

        return ret;
    }

}