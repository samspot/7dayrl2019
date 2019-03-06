import { Actor } from './actor.js'
import * as ROT from 'rot-js'
import { MoveAction, DefaultAction, AbilityAction } from './actions.js';

export class Monster extends Actor {
    constructor(x, y, game, mobspec) {
        super(x, y, mobspec.symbol, mobspec.color, game)

        this.name = mobspec.name
        this.hp = mobspec.hp
        this.str = mobspec.str
        this.score = mobspec.score
    }

    // return a list of abilities that are off cooldown and can reach the player
    getAvailableAbilities() {
        // console.log(this.name, 'getAvailableAbilities()', this.abilities)
        let usable = _.filter(this.abilities, a => a.cooldown === 0).filter(a => {
            let player = this.game.player
            let x = player.x
            let y = player.y

            return player.inRange(a, player, this.x, this.y)
        })
        // console.log('available', usable)
        return usable
    }

    act() {
        this.tickAbilities()
        var x = this.game.player.getX()
        var y = this.game.player.getY()

        if(this.isBoss()){
            // console.log("boss abilities", this.abilities)
        }
        let abilities = this.getAvailableAbilities()
        if (abilities && abilities.length > 0) {
            let a = ROT.RNG.getItem(abilities)
            console.log("monster.act() using ", a)
            return new Promise(resolve => {
                resolve(new AbilityAction(this, a, x, y))
            })
        }

        let passableCallback = (x, y) => x + ',' + y in this.game.map
        var astar = new ROT.Path.AStar(x, y, passableCallback, { topology: 4 })

        var path = []
        var pathCallback = function (x, y) {
            path.push([x, y])
        }
        astar.compute(this.x, this.y, pathCallback)

        path.shift()

        return new Promise((resolve, reject) => {

            if (!path[0]) {
                resolve(new DefaultAction(this))
            }

            x = path[0][0]
            y = path[0][1]

            resolve(new MoveAction(this, undefined, x, y))
        })
    }
}
