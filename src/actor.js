
import * as ROT from 'rot-js'

export class Actor {
    constructor(x, y, symbol, color, game) {
        this._x = x
        this._y = y
        this._symbol = symbol
        this._color = color
        this._game = game
        this._draw()
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
