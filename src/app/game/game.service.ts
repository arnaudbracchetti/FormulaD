import { BoardDefinitionService } from '../board-definition/board-definition.service';
import { Car } from './model/car';
import { Game } from './model/game';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class GameService {

    private cars: BehaviorSubject<Car[]> = new BehaviorSubject<Car[]>([]);
    private selectedGame: Game;
    private boardDefinitionService: BoardDefinitionService;

    constructor(boardService: BoardDefinitionService) {
        this.boardDefinitionService = boardService;
    }

    public loadGame() {

        this.boardDefinitionService.selectBoard('Circuit3');

        this.selectedGame = new Game();
        this.selectedGame.cars.push(new Car(this.boardDefinitionService.getStartingPosition()[0]));
        // this.selectedGame.board = this.boardDefinitionService.ge;
    }

}
