
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
    public selectedBoardImageFile: string;
    //public selectedBoardSpacesDefinitions: Map<string, SpaceDefinition> = new Map<string, SpaceDefinition>();
    private selectedBoardSpacesDefinitions: BehaviorSubject<Map<string, SpaceDefinition>> = new BehaviorSubject<Map<string, SpaceDefinition>>(new Map());

    public db: AngularFireDatabase;
    private spaceDefinitionRef: firebase.database.Reference;


    constructor(db: AngularFireDatabase) {
        this.db = db;
    }


    public getSpaceDefinitions(): Observable<SpaceDefinition[]> {
        return this.selectedBoardSpacesDefinitions.asObservable().map((map) => {
            let ret: SpaceDefinition[] = [];
            map.forEach((item) => ret.push(item));
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
     * return an array with all space definition with isStartPosition attribut set to true
     */
    public getStartingPosition(): SpaceDefinition[] {
        let ret: SpaceDefinition[];
        let spaceDefs: Map<string, SpaceDefinition> = this.selectedBoardSpacesDefinitions.getValue();
        spaceDefs.forEach((value) => {
            if (value.isStartPosition) {
                ret.push(value);
            }
        });

        return ret;
    }



    /**
     * Initialize game board information from database. This methode should be called before
     * all other methods on this service.
     *
     * @param boardKey board game id to load from database
     *
     */
    public async selectBoard(boardKey: string) {

        this.selectedBoardKey = boardKey;



        this.selectedBoardSpacesDefinitions.getValue().forEach((value, key) => value.remove());
        this.selectedBoardSpacesDefinitions.getValue().clear();
        this.selectedBoardSpacesDefinitions.next(this.selectedBoardSpacesDefinitions.getValue());



        if (this.spaceDefinitionRef) {
            this.spaceDefinitionRef.child('Objects').off();
        }
        this.spaceDefinitionRef = this.db.database.ref(`SpaceDefinitions/${this.selectedBoardKey}`);

        // load all space definitions in one block
        let objectRef = this.spaceDefinitionRef.child('Objects');
        let loadSpaceDef = objectRef.once('value').then((snap) => {
            let sdMap: Map<string, SpaceDefinition> = new Map<string, SpaceDefinition>();
            snap.forEach((item) => {
                let val: SpaceDefinition = item.val();
                let sd = this.instanciateSpaceDefintion(item.key, val.x, val.y, val.angle, val.isStartPosition);
                sdMap.set(item.key, sd);

            });
            this.selectedBoardSpacesDefinitions.next(sdMap);
        });

        let loadMap = this.db.database.ref(`BoardDefinitions/${this.selectedBoardKey}/mapFile`).once('value').then(
            (snapshot) => {
                this.selectedBoardImageFile = `../assets/${snapshot.val()}`;
            });

        await loadSpaceDef;
        await loadMap;

        console.log('load ok');

        objectRef.on('child_added', (snap) => {
            let val: SpaceDefinition = snap.val();
            this.onAddNewSpaceDefinition(snap.key, val.x, val.y, val.angle, val.isStartPosition);
        });

        objectRef.on('child_removed', (snap) => {
            this.onRemoveSpaceDefinition(snap.key);
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
        if (this.selectedBoardSpacesDefinitions.getValue().has(id)) {
            return this.selectedBoardSpacesDefinitions.getValue().get(id);

        } else {

            let spaceDef: SpaceDefinition = this.instanciateSpaceDefintion(id, x, y, angle, isStartPosition);

            this.selectedBoardSpacesDefinitions.getValue().set(spaceDef.id, spaceDef);
            this.selectedBoardSpacesDefinitions.next(this.selectedBoardSpacesDefinitions.getValue());

            return spaceDef;
        }
    }



    private onRemoveSpaceDefinition(key: string) {
        this.selectedBoardSpacesDefinitions.getValue().get(key).remove();
        this.selectedBoardSpacesDefinitions.getValue().delete(key);
        this.selectedBoardSpacesDefinitions.next(this.selectedBoardSpacesDefinitions.getValue());
    }


    private instanciateSpaceDefintion(id: string, x: number, y: number, angle?: number, isStartPosition?: boolean): SpaceDefinition {
        let spaceDef: SpaceDefinition = new SpaceDefinitionImpl(id, x, y, angle, isStartPosition);
        spaceDef = new SpaceDefinitionFirebasePercitence(spaceDef, this.spaceDefinitionRef, this);

        return spaceDef;
    }

}
