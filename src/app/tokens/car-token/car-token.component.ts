import { Car } from '../../game/model/car';
import { GameElement, Action, NoopAction } from '../gameelement';
import { Component, OnInit, Input } from '@angular/core';
import { ToolEvent, Group, Path, Point, Size } from 'paper';

@Component({
    selector: 'fd-car-token',
    template: ''
})
export class CarTokenComponent extends GameElement implements OnInit {

    public id: string;

    @Input() public car: Car;

    private representation: Group;

    constructor() {
        super();

        this.representation = new Group();
        this.representation.applyMatrix = false;
        this.representation.name = 'car-token';
        this.representation.data = this.id;
    }

    ngOnInit() {
        this.createRepresentation();
        this.draw();
    }

    public isSelected(): boolean {
        return false;
    }
    public toggleSelect() {

    }
    public getAction(evt: ToolEvent): Action {
        return new NoopAction();
    }

    public draw() {
        this.representation.position = new Point(this.car.position.x, this.car.position.y);
        this.representation.rotation = this.car.position.angle;


    }

    private createRepresentation() {
        let car = new Path.Rectangle(new Point(0, 0), new Size(new Point(60, 30)));
        car.strokeColor = 'black';
        car.fillColor = 'red';
        this.representation.addChild(car);
    }

}

