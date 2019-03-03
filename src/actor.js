
import * as ROT from 'rot-js'
import Tyrant from 'assets/tyrant.json'
import Zombie from 'assets/zombie.json'
import Jill from 'assets/jill.json'

export class Actor {
    constructor(x, y, symbol, color, game) {
        this._x = x
        this._y = y
        this._symbol = symbol
        this._color = color
        this._game = game
        this._draw()

        console.log("Tyrant", Tyrant.hp, "Zombie", Zombie.hp, "Jill", Jill.hp)
    }

    _draw() {
        this._game.display.draw(this._x, this._y, this._symbol, this._color)
    }

    getX() {
        return this._x
    }

    getY() {
        return this._y
    }
}
