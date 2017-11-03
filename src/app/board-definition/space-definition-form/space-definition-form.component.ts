import { SpaceDefinition } from '../model/space-definition';
import { style, trigger, state, transition, animate } from '@angular/animations';
import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'fd-space-definition-form',
    templateUrl: './space-definition-form.component.html',
    styleUrls: ['./space-definition-form.component.scss'],
    animations: [
        trigger('visible', [

            transition(':enter', [
                style({ opacity: '0' }),
                animate(200)]),
            transition(':leave', [
                animate(200,
                    style({ opacity: '0' }))])
        ])


    ]
})
export class SpaceDefinitionFormComponent implements OnInit {

    @Input() model: SpaceDefinition;
    @Input() visible: boolean;

    constructor() { }

    ngOnInit() {
    }

}
