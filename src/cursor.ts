import { Actor } from './actor'
import { Game } from './game';

export class Cursor extends Actor {
    constructor(x: number, y: number, game: Game) {
        super(x, y, '#', 'white', game)
        this.shouldDrawOtherCharacters = true
    }
}