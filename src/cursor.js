import { Actor } from './actor.js'

export class Cursor extends Actor {
    constructor(x, y, game) {
        super(x, y, '#', 'white', game)
    }
}