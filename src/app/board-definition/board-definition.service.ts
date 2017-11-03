
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { SpaceDefinitionImpl, SpaceDefinition } from './model/space-definition';
import { SpaceDefinitionFirebasePercitence } from './model/space-definition-percistence.decorator';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export class BoardDefinition {
    public key: string;
    public name: string;
    public boardImageFile: string;
}



@Injectable()
export class BoardDefinitionService {

    public selectedBoardKey: string = 'Circuit1';  // TODO:  supprimer cette initialisation
    public selectedBoardImageFile: Promise<string>;
    //public selectedBoardSpacesDefinitions: Map<string, SpaceDefinition> = new Map<string, SpaceDefinition>();
    private selectedBoardSpacesDefinitions: BehaviorSubject<Map<string, SpaceDefinition>> = new BehaviorSubject<Map<string, SpaceDefinition>>(new Map());

    public db: AngularFireDatabase;
    private spaceDefinitionRef: firebase.database.Reference;


    constructor(db: AngularFireDatabase) {
        this.db = db;
    }


    public getSpaceDefinitionKeys(): Observable<string[]> {
        return this.selectedBoardSpacesDefinitions.asObservable().map((map) => {
            let ret = [];
            map.forEach((item) => ret.push(item.id));
            return ret;
        });
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

        let ret = this.selectedBoardSpacesDefinitions.getValue().get(id);

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
        this.selectedBoardSpacesDefinitions.getValue().clear();
        this.selectedBoardSpacesDefinitions.next(this.selectedBoardSpacesDefinitions.getValue());
        this.spaceDefinitionRef = this.db.database.ref(`SpaceDefinitions/${this.selectedBoardKey}`);

        //TODO: Clean old selection before loading a new one

        let ref = this.db.list<SpaceDefinition>(this.spaceDefinitionRef.child('Objects'));
        ref.stateChanges().subscribe(action => {
            switch (action.type) {
                case 'child_added':
                    let val: SpaceDefinition = action.payload.val();
                    this.onAddNewSpaceDefinition(action.key, val.x, val.y, val.angle, val.isStartPosition);
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
        this.spaceDefinitionRef.child('Objects').push(
            {
                x: x,
                y: y
            });

    }

    public removeSpaceDefinitionById(id: string) {

        this.spaceDefinitionRef.child('Objects').child(id).remove();
        this.spaceDefinitionRef.child('Links').child(id).remove();

    }

    private onAddNewSpaceDefinition(id: string, x: number, y: number, angle?: number, isStartPosition?: boolean): SpaceDefinition {
        let spaceDef: SpaceDefinition = new SpaceDefinitionImpl(id, x, y, angle, isStartPosition);
        spaceDef = new SpaceDefinitionFirebasePercitence(spaceDef, this.spaceDefinitionRef, this);

        this.selectedBoardSpacesDefinitions.getValue().set(spaceDef.id, spaceDef);
        this.selectedBoardSpacesDefinitions.next(this.selectedBoardSpacesDefinitions.getValue());

        return spaceDef;
    }



    private onRemoveSpaceDefinition(key: string) {
        this.selectedBoardSpacesDefinitions.getValue().get(key).remove();
        this.selectedBoardSpacesDefinitions.getValue().delete(key);
        this.selectedBoardSpacesDefinitions.next(this.selectedBoardSpacesDefinitions.getValue());
    }



}
