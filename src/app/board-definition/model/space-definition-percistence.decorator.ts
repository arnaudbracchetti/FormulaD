
import { BoardDefinitionService } from '../board-definition.service';
import { SpaceDefinitionDecorator, SpaceDefinition, SpaceDefinitionChange } from './space-definition';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';


/**
 * Decorator class to add percistence capability to a SpaceDefinition instance
 * This implementation use Firebase.database library
 */

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

    getChangeObservable(): Observable<SpaceDefinitionChange> {
        return this.decorated.getChangeObservable();
    }

    touchLink() {
        this.decorated.touchLink();
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

        // TODO: currently spaceDefinition is delete from data base in BordDefinitionService
        // we should change this in the furtur

        // TODO: all callbacks are removed from the ref, this could generate issue later.

        this.dbSpaceDefinitionObjectRef.off('value');
        this.dbSpaceDefinitionLinkRef.off('child_added');
        this.dbSpaceDefinitionLinkRef.off('child_removed');

    }

    public save() {

        // we debounce database call.In construction mode, when we move a SpaceDefinition
        // on the screen, we can make data chage very often. We donc need to save in database
        // all chages but only the last one.
        clearTimeout(this.timeoutHandler);

        this.timeoutHandler = setTimeout(() =>
            this.dbSpaceDefinitionObjectRef.update(
                {
                    x: this.x,
                    y: this.y,
                    angle: this.angle
                }), 1000);

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

        if (val) {  // val can be null after a delete from database operation
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
        this.self.addLink(target.self);
        this.autoSave = true;
    }

    private onLinkRemoved(snapshot: firebase.database.DataSnapshot) {
        let target = this.boardDefinitionService.getSpaceDefinitionFromId(snapshot.key);

        this.autoSave = false;
        this.self.removeLink(target.self);
        this.autoSave = true;
    }

}
