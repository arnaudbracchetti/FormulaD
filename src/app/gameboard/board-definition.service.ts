
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { SpaceDefinitionImpl, SpaceDefinition } from './space-definition';
import { SpaceDefinitionFirebasePercitence } from './space-definition-percistence.decorator';
import { SpaceDefinitionPaperRepresentation } from './space-definition-representation.decorator';
import { Injectable } from '@angular/core';

export class BoardDefinition {
    public key: string;
    public name: string;
    public boardImageFile: string;
}


@Injectable()
export class BoardDefinitionService {

    public selectedBoardKey: string = 'Circuit1';  // TODO:  supprimer cette initialisation
    public selectedBoardImageFile: Promise<string>;
    public selectedBoardSpacesDefinitions: Map<string, SpaceDefinition> = new Map<string, SpaceDefinition>();

    public db: AngularFireDatabase;
    private spaceDefinitionRef: firebase.database.Reference;


    constructor(db: AngularFireDatabase) {
        this.db = db;
    }


    /**
     * return the list of all tracks as a Promise
     */
    public getBoardDefinitionList(): Promise<Array<BoardDefinition>> {

        let ret = new Promise((resolve, reject) => {
            this.db.database.ref(`BoardDefinitions`).once('value', (snapshot) => {
                let val = snapshot.val();
                let list = new Array<BoardDefinition>();

                for (let item in val) {
                    if (val.hasOwnProperty(item)) {
                        let boardDef = new BoardDefinition();
                        boardDef.key = item;
                        boardDef.boardImageFile = `../assets/${val[item].mapFile}`;
                        boardDef.name = val[item].name;

                        //TODO : Ajouter la gestion de vignettes pour limiter le trafic réseau

                        list.push(boardDef);
                    }


                }
                console.log(list);
                resolve(list);
            });
        });


        return ret;
    }

    /**
     * return a SpaceDefinition from the selected game board by this ID
     *
     * @param id: id of the SpaceDefinition to find
     * @throw an Error if the id is not found in the game board
     */
    public getSpaceDefinitionFromId(id: string) {

        let ret = this.selectedBoardSpacesDefinitions.get(id);

        if (!ret) {
            throw (new Error('getSpaceDefinitionFromId(): Id not found'));
        }

        return ret;

    }


    /**
     * Initialize game board information from database. This methode should be called prior
     * all other methods on this service.
     *
     * @param boardKey board game id to load from database
     *
     */
    public selectBoard(boardKey: string) {

        this.selectedBoardKey = boardKey;
        this.selectedBoardSpacesDefinitions.clear();
        this.spaceDefinitionRef = this.db.database.ref(`SpaceDefinitions/${this.selectedBoardKey}`);

        //TODO: Clean old selection before loading a new one

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

        this.selectedBoardImageFile = new Promise<string>((resolve, reject) => {
            this.db.database.ref(`BoardDefinitions/${this.selectedBoardKey}/mapFile`).once('value', (snapshot) => {
                resolve(`../assets/${snapshot.val()}`);
            });
        });


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

        this.selectedBoardSpacesDefinitions.set(spaceDef.id, spaceDef);

        return spaceDef;
    }

    public removeSpaceDefinition(spaceDef: SpaceDefinition) {

        this.spaceDefinitionRef.child('Objects').child(spaceDef.id).remove();
        this.spaceDefinitionRef.child('Links').child(spaceDef.id).remove();

    }

    private onRemoveSpaceDefinition(key: string) {
        this.selectedBoardSpacesDefinitions.get(key).remove();
        this.selectedBoardSpacesDefinitions.delete(key);
    }



}
