import { Actor } from './actor.js'
import * as ROT from 'rot-js'
import { MoveAction, DefaultAction, AbilityAction } from './actions.js';

// import Jill from '../assets/img/jill.png'
// import Chris from '../assets/img/chris.png'
// import Barry from '../assets/img/barry.png'
// import Wesker from '../assets/img/wesker.png'
// import Brad from '../assets/img/brad.png'
import Empty75x75 from '../assets/img/empty.png'
import { Charge } from './abilities.js';

export class Monster extends Actor {
    constructor(x, y, game, mobspec) {
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

    playerSeen() {
        return this.seen
    }

    setSeen() {
        if (this.boss && !this.seen) {
            let gp = this.game.getGameProgress()

            let targetImage = new Image()
            targetImage.src = Empty75x75
            targetImage.id = 'boss-splash'

            let text = `<p style="color: red">TARGET<p> <b>${this.name}</b><p> HP ${this.hp}/${this.maxHp}<br> Melee Damage ${this.str}`
            text += `<p>${this.bio}<p>"${this.quote}"`

            let div = document.createElement('div')

            let span = document.createElement('span')
            span.innerHTML = text

            div.appendChild(targetImage)

            div.appendChild(span)

            this.game.gameDisplay.showModal(text, div)

            let display = this.game.gameDisplay
            let bossName = display.getNameMap()[gp.boss]
            display.renderCharacter(bossName, 'boss-splash')
        }
        this.seen = true
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
        _.remove(usable, x => x instanceof Charge)
        // console.log('available', usable)
        return usable
    }

    act() {
        this.tickAbilities()
        var x = this.game.player.getX()
        var y = this.game.player.getY()

        let abilities = this.getAvailableAbilities()
        if (abilities && abilities.length > 0) {
            let a = ROT.RNG.getItem(abilities)
            // TODO add this log to debug flag
            // console.log("monster.act()", this.name, "using ", a.constructor.name, a)
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

        if (this.isBoss()) {
            // console.log('acting', path[0], path[1], this.name, this.x, this.y)
        }

        path.shift()
        // console.log(`spawn-${this.spawnId} ${this.x},${this.y} path is ${path} for [${this.name}] player at ${this.game.player.x},${this.game.player.y} mob moving to ${path[0][0]},${path[0][1]}`)

        return new Promise((resolve, reject) => {

            if (!path[0]) {
                // console.log('returning default action')
                // resolve(new DefaultAction(this))
                console.log('kill level boss, were in a bad stae', path[0], path[1], this.name, this.x, this.y)
                this.game.destroyMob(this)
                delete this.game.director.boss
                this.game.killBoss()
                this.game.message(this.name + " got lost so we killed him.  You may proceed to the next level ('>' key)", true)

                // this.game.message(`A horde of ${this.name}'s arise from the pieces`, true)
                // this.game.message('The boss is cloning itself, get out NOW!', true)
                resolve()
                return
            }

            // if (this.isBoss()) {
            // console.log('acting', path[0], path[1], this.name, this.x, this.y)
            // }
            x = path[0][0]
            y = path[0][1]

            resolve(new MoveAction(this, undefined, x, y))
        })
    }
}
