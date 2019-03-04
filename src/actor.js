
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
        this.draw()
        this.boss = false

        // console.log("Tyrant", Tyrant.hp, "Zombie", Zombie.hp, "Jill", Jill.hp)
    }

    isPlayer() {
        return false
    }

    isBoss(){
        return this.boss
    }

    draw(symbol, color) {
        let symbolToDraw = this._symbol
        let colorToDraw = this._color
        if(symbol){
            symbolToDraw = symbol
            colorToDraw = color
        }
        this._game.display.draw(this._x, this._y, 
            symbolToDraw, colorToDraw)
        // console.log(this.name, this.hp)
    }

    getX() {
        return this._x
    }

    getY() {
        return this._y
    }

    out(){
        return this._symbol + ' ' + this._x + ',' + this._y
    }
}
