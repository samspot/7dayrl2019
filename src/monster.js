import { Actor } from './actor.js'
import * as ROT from 'rot-js'
import { MoveAction, DefaultAction } from './actions.js';

export class Monster extends Actor {
    constructor(x, y, game, mobspec) {
        super(x, y, mobspec.symbol, mobspec.color, game)

        this.name = mobspec.name
        this.hp = mobspec.hp
    }

    act() {
        var x = this._game.player.getX();
        var y = this._game.player.getY();
        let passableCallback = (x, y) => x + ',' + y in this._game.map
        var astar = new ROT.Path.AStar(x, y, passableCallback, { topology: 4 })

        var path = []
        var pathCallback = function (x, y) {
            path.push([x, y])
        }
        astar.compute(this._x, this._y, pathCallback)

        path.shift()

        return new Promise((resolve, reject) => {
            // if (path.length == 1) {
                // this._game.gameover("Game over - you were captured by", this.name)
            // } else {
                // if (typeof path[0] === "undefined") {
                    // this._game.gameover("Game over - you were captured by", this.name)
                    // return
                // }

                if(!path[0]){
                    resolve(new DefaultAction(this))
                }

                x = path[0][0]
                y = path[0][1]

                resolve(new MoveAction(this, undefined, x, y))
            // }
        })
    }
}
