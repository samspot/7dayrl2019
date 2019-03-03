import {Actor} from './actor.js'
import * as ROT from 'rot-js'

export class Pedro extends Actor {
    constructor(x, y, game) {
        super(x, y, "P", "red", game)
    }

    act() {
        var x = this._game.player.getX();
        var y = this._game.player.getY();
        /*
        var passableCallback = function (x, y) {
            return (x + "," + y in Game.map)
        }
        */
        let passableCallback = (x, y) => x + ',' + y in this._game.map
        var astar = new ROT.Path.AStar(x, y, passableCallback, { topology: 4 })

        var path = []
        var pathCallback = function (x, y) {
            path.push([x, y])
        }
        astar.compute(this._x, this._y, pathCallback)

        path.shift()
        if (path.length == 1) {
            this._game.engine.lock()
            alert("Game over - you were captured by Pedro!")
        } else {
            x = path[0][0]
            y = path[0][1]
            this._game.display.draw(this._x, this._y, this._game.map[this._x + "," + this._y])
            this._x = x
            this._y = y
            this.draw()
        }
    }
}
