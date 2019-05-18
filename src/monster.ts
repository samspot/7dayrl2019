import * as _ from 'lodash';
import { Path } from 'rot-js';
import { Charge } from './abilities';
import { abilityAction, moveAction } from './allactions';
import { Actor } from './actor';
import { Game } from './game';
import { MobSpec } from "./MobSpec";
import Config from './config';
import { Stunned } from './status';
import { getRandItem } from './random';

export class Monster extends Actor {
    bio: string
    quote: string
    constructor(x: number, y: number, game: Game, mobspec: MobSpec) {
        super(x, y, mobspec.symbol, mobspec.color, game)

        this.name = mobspec.name
        this.nickname = mobspec.nickname
        this.maxHp = mobspec.hp
        this.hp = mobspec.hp
        this.str = mobspec.str
        this.score = mobspec.score
        this.sightRadius = mobspec.sightRadius
        this.seen = false
        this.bio = mobspec.bio || ''
        this.quote = mobspec.quote || ''
        this.speed = mobspec.speed || 100
    }

    // return a list of abilities that are off cooldown and can reach the player
    _getAvailableAbilities() {
        if (_.findIndex(this.game.getVisibleMobs(), m => m === this) < 0) {
            // console.log('mob not visible, dont use abilities')
            return []
        }
        // console.log(this.name, 'getAvailableAbilities()', this.abilities)
        let usable = _.filter(this.abilities, a => a.cooldown === 0).filter(a => {
            let player = this.game.player
            let x = player.x
            let y = player.y

            return player.inRange(a, player, this.x, this.y)
        })

        if (!window.directorsCut && !Config.enableCharge) {
            _.remove(usable, x => x instanceof Charge)
            // console.log('charge disabled')
        } else {
            // console.log('charge enabled')
        }
        // console.log('available', usable)
        return usable
    }

    act() {
        this.tickAbilities()

        if (this.name === 'stairs') { return }

        if (this.statuses.filter(s => s instanceof Stunned).length > 0) {
            _.remove(this.statuses, s => s instanceof Stunned)
            console.log('found stunned, skipping turn', this)
            this.game.message(this.name + ' missed turn due to being Stunned')
            return
        }
        var x = this.game.player.getX()
        var y = this.game.player.getY()

        let abilities = this._getAvailableAbilities()
        if (abilities && abilities.length > 0) {
            let a = getRandItem(abilities)
            // console.log("monster.act()", this.name, "using ", a.constructor.name, a)
            return new Promise(resolve => {
                resolve(abilityAction(this, a, x, y))
            })
        }

        let passableCallback = (x: number, y: number) => x + ',' + y in this.game.map
        var astar = new Path.AStar(x, y, passableCallback, { topology: 4 })

        var pathList: Array<Array<number>> = []
        var pathCallback = function (x: number, y: number) {
            pathList.push([x, y])
        }
        astar.compute(this.x, this.y, pathCallback)

        if (this.isBoss()) {
            // console.log('acting', path[0], path[1], this.name, this.x, this.y)
        }

        let oldpath = pathList.shift()
        let path = pathList[0]
        if (!path) {
            console.log(`spawn-${this.spawnId} ${this.x},${this.y} path is ${path} for [${this.name}] player at ${this.game.player.x},${this.game.player.y} mob moving to ${path},${path}`)
            path = oldpath
        }

        return new Promise((resolve, reject) => {

            if (!path) {
                this.game.message(this.name + ' is stuck!')

                resolve()
                return
            }

            x = path[0]
            y = path[1]

            // Slow down mob actions for visible creatures
            let timeout = 50
            if (!this.game.getVisibleMobs().includes(this)) {
                timeout = 0
            }

            setTimeout(() => {
                resolve(moveAction(this, undefined, x, y))
            }, timeout)
        })
    }
}
