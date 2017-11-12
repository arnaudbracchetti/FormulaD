import { BoardDefinition } from '../../board-definition/board-definition.service';
import { Car } from './car';

export class Game {
    public cars: Car[];
    public board: BoardDefinition;
}
