import { SpaceDefinition } from '../model/space-definition';
import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'fd-space-definition-form',
    templateUrl: './space-definition-form.component.html',
    styleUrls: ['./space-definition-form.component.scss']
})
export class SpaceDefinitionFormComponent implements OnInit {

    @Input() model: SpaceDefinition;

    constructor() { }

    ngOnInit() {
    }

}
