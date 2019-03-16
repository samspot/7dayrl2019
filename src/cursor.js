import { Actor } from './actor'

export class Cursor extends Actor {
    constructor(x, y, game) {
        super(x, y, '#', 'white', game)
    }
}