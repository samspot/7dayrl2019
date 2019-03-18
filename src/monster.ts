import { Actor } from './actor'
import * as ROT from 'rot-js'
import { Game, MobSpec } from './game'
import * as _ from 'lodash'

import Empty75x75 from '../assets/img/empty.png'
import { Charge } from './abilities';
import Config from './config';
import { AbilityAction, DefaultAction, MoveAction } from './actions';


export class Monster extends Actor {
    bio: string
    quote: string
    constructor(x: number, y: number, game: Game, mobspec: MobSpec) {
        super(x, y, mobspec.symbol, mobspec.color, game)

        this.name = mobspec.name
        this.maxHp = mobspec.hp
        this.hp = mobspec.hp
        this.str = mobspec.str
        this.score = mobspec.score
        this.sightRadius = mobspec.sightRadius
        this.seen = false
        this.bio = mobspec.bio || ''
        this.quote = mobspec.quote || ''
    }

    // return a list of abilities that are off cooldown and can reach the player
    getAvailableAbilities() {
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

        // TODO fix charge
        // if(!Config.enableCharge){
        if (!window.directorsCut) {
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
        var x = this.game.player.getX()
        var y = this.game.player.getY()

        let abilities = this.getAvailableAbilities()
        if (abilities && abilities.length > 0) {
            //@ts-ignore
            let a = ROT.RNG.getItem(abilities)
            // TODO add this log to debug flag
            // console.log("monster.act()", this.name, "using ", a.constructor.name, a)
            return new Promise(resolve => {
                resolve(new AbilityAction(this, a, x, y))
            })
        }

        let passableCallback = (x: number, y: number) => x + ',' + y in this.game.map
        var astar = new ROT.Path.AStar(x, y, passableCallback, { topology: 4 })

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
                // console.log('returning default action')
                // resolve(new DefaultAction(this))
                // console.log('kill level boss, were in a bad stae', path[0], path[1], this.name, this.x, this.y)
                // this.game.destroyMob(this)
                // delete this.game.director.boss
                // this.game.killBoss()
                // this.game.message(this.name + " got lost so we killed him.  You may proceed to the next level ('>' key)", true)
                this.game.message(this.name + ' is stuck!')

                // this.game.message(`A horde of ${this.name}'s arise from the pieces`, true)
                // this.game.message('The boss is cloning itself, get out NOW!', true)
                // resolve(new DefaultAction())
                resolve()
                return
            }

            // if (this.isBoss()) {
            // console.log('acting', path[0], path[1], this.name, this.x, this.y)
            // }
            x = path[0]
            y = path[1]

            resolve(new MoveAction(this, undefined, x, y))
        })
    }
}