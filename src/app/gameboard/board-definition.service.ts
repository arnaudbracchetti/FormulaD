
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { SpaceDefinitionImpl, SpaceDefinitionPaperRepresentation, SpaceDefinition, SpaceDefinitionFirebasePercitence } from './space-definition';
import { Injectable } from '@angular/core';

@Injectable()
export class BoardDefinitionService {

    public boardKey: string = 'Circuit1';
    public mapFile: string;
    public spacesDefinitions: Map<string, SpaceDefinition> = new Map<string, SpaceDefinition>();

    public db: AngularFireDatabase;
    private spaceDefinitionRef: firebase.database.Reference;


    constructor(db: AngularFireDatabase) {
        this.db = db;
    }

    /**
     * return a SpaceDefinition from the game board by this ID
     *
     * @param id: id of the SpaceDefinition to find
     * @throw an Error if the id is not found in the game board
     */
    public getSpaceDefinitionFromId(id: string) {

        let ret = this.spacesDefinitions.get(id);

        if (!ret) {
            throw (new Error('getSpaceDefinitionFromId(): Id not found'));
        }

        return ret;

    }


    /**
     * Initialize game borard information from database. This methode should be called prior
     * all other methods on this service.
     *
     * @param boardKey board game id to load from database
     * @return a Promise resolved when initialisation is done
     */
    public load(boardKey: string): Promise<any> {

        this.boardKey = boardKey;
        this.spaceDefinitionRef = this.db.database.ref(`BoardDefinitions/${this.boardKey}/SpaceDefinitions`);


        let ref = this.db.list<SpaceDefinition>(this.spaceDefinitionRef.child('Objects'));
        ref.stateChanges().subscribe(action => {
            switch (action.type) {
                case 'child_added':
                    let val: SpaceDefinition = action.payload.val();
                    this.onAddNewSpaceDefinition(action.key, val.x, val.y, val.angle);
                    break;
                case 'child_removed':
                    this.onRemoveSpaceDefinition(action.key);
                    break;
            }

        });

        let ret = new Promise((resolve, reject) => {
            this.db.database.ref(`BoardDefinitions/${this.boardKey}/mapFile`).once('value', (snapshot) => {
                this.mapFile = snapshot.val();
                resolve();
            });
        });

        return ret;
    }

    public addNewSpaceDefinition(x: number, y: number) {
        console.log(x + ' , ' + y);
        this.spaceDefinitionRef.child('Objects').push(
            {
                x: x,
                y: y
            });

    }

    private onAddNewSpaceDefinition(id: string, x: number, y: number, angle?: number): SpaceDefinition {
        let spaceDef: SpaceDefinition = new SpaceDefinitionImpl(id, x, y, angle);
        spaceDef = new SpaceDefinitionFirebasePercitence(spaceDef, this.spaceDefinitionRef, this);
        spaceDef = new SpaceDefinitionPaperRepresentation(spaceDef);

        this.spacesDefinitions.set(spaceDef.id, spaceDef);

        return spaceDef;
    }

    public removeSpaceDefinition(spaceDef: SpaceDefinition) {

        this.spaceDefinitionRef.child('Objects').child(spaceDef.id).remove();

    }

    private onRemoveSpaceDefinition(key: string) {
        this.spacesDefinitions.get(key).remove();
        this.spacesDefinitions.delete(key);
    }



}
