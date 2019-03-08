import * as ROT from 'rot-js'
import { YouWinAction, DamageAction, InfectAbilityAction } from './actions';

export class Ability {
    constructor(actor, cooldown, range, dmg) {
        this.actor = actor
        this.maxCooldown = cooldown
        this.cooldown = 0
        this.range = range
        this.dmg = dmg
        this.use = this.use.bind(this)
    }

    // TODO tick for mobs, use for mobs
    tick() {
        this.cooldown--
        if (this.cooldown < 0) { this.cooldown = 0 }
    }

    use(e) {
        e.preventDefault()
        this.actor.useAbility(this)
    }

    inRange(position, target) {
        // TODO implement range
        return true
    }

    getRandomAbility() {
        let a = ROT.RNG.getItem(abilities)
        // console.log(a)
        return a
    }

    sideEffects(action, game) {
        // console.log('no side effects')
    }

    canTargetEmpty() {
        return false
    }
}

export class EmptySlot extends Ability {
    constructor(actor) {
        super(actor, 0, 1, 0)
    }
}

function getCoordsAround(x, y) {
    return [
        [x - 1, y - 1], // NW
        [x, y - 1],     // N
        [x + 1, y - 1], // NE
        [x + 1, y],     // E
        [x + 1, y + 1], // SE
        [x, y + 1],     // S
        [x - 1, y + 1], // SW
        [x - 1, y],     // W
    ]
}

function getCardinalCoords(x, y) {
    return {
        N: [x, y - 1],     // N
        E: [x + 1, y],     // E
        S: [x, y + 1],     // S
        W: [x - 1, y],     // W
    }
}

function isTrapped(map, x, y) {
    let trapped = _.map(getCardinalCoords(x, y), coordlist => {
        return map[coordlist[0] + ',' + coordlist[1]] !== '.'
    })
    return _.every(trapped)
}

export class Charge extends Ability {
    constructor(actor) {
        super(actor, 10, 10, 20)
    }

    sideEffects(action, game, actor) {

        let source = this.actor
        let target = actor
        if (actor) {

            // console.log(`source (${source.x}, ${source.y}) target (${target.x}, ${target.y})`)

            let xdiff = source.x - target.x
            let ydiff = source.y - target.y

            // console.log(`diff ${xdiff} ${ydiff}`)

            if (xdiff > 0) { target.x-- }
            if (xdiff < 0) { target.x++ }
            if (ydiff > 0) { target.y-- }
            if (ydiff < 0) { target.y++ }
        }

        source.x = action.x
        source.y = action.y

        // player using, so drill holes where they targetted
        if (source === game.player) {

            // console.log('creating map hole', action.x, ',', action.y)
            game.map[action.x + ',' + action.y] = '.'

            // TODO drill around if player is trapped
            if (isTrapped(game.map, action.x, action.y)) {
                // console.log('player trapped')
                let cardinals = getCardinalCoords(action.x, action.y)
                Object.keys(cardinals).forEach(k => {
                    let x = cardinals[k][0]
                    let y = cardinals[k][1]
                    // console.log("hollowing ", x, ',', y, cardinals[k])
                    game.map[x + ',' + y] = '.'
                })
            }
        }

        // also drill a hole wherever something was pushed
        if (target) {
            // console.log('creating map hole', target.x, ',', target.y)
            game.map[target.x + ',' + target.y] = '.'
        }
        game.dirty = true
    }

    canTargetEmpty() {
        return true
    }
}

export class Infect extends Ability {
    constructor(actor) {
        // same damage as melee for this character - use this.str
        let infectStr = actor.str
        if (infectStr < 20) { infectStr = 20 }
        super(actor, 1, 3, infectStr)
    }

    // action.actor - player
    // actor - monster
    // most actions just run their execute(game) method
    sideEffects(action, game, actor) {
        console.log("infect", action, game, actor)
        game.scheduler.add({
            act: () => {
                return new InfectAbilityAction(action.actor, actor, action)
            },
            isPlayer: () => false
        })
    }
}

export class GrenadeLauncher extends Ability {
    constructor(actor) {
        super(actor, 10, 20, 30)
    }

    sideEffects(action, game) {
        let sets = getCoordsAround(action.x, action.y)
        sets.forEach(s => {
            game.display.draw(s[0], s[1], "*", "red")


            setTimeout(() => {
                game.dirty = true
            }, 0)

            let actor = game.getCharacterAt(null, s[0], s[1])
            if (actor) {
                // TODO this might not be working
                console.log("launcher splash damaging actor", actor, this.dmg / 2)

                game.scheduler.add({
                    act: () => {
                        return new DamageAction(actor, this.dmg / 2, "Grenade Launcher Splash Damage", actor)
                    },
                    isPlayer: () => false
                })
            }
        })
    }

    canTargetEmpty() {
        return true
    }
}

export class Shotgun extends Ability {
    constructor(actor) {
        super(actor, 3, 5, 20)
    }
}

export class Magnum extends Ability {
    constructor(actor) {
        super(actor, 3, 10, 50)
    }
}

export class Impale extends Ability {
    constructor(actor) {
        super(actor, 5, 1, 40)
    }
}

export class Grab extends Ability {
    constructor(actor) {
        super(actor, 2, 1, 10)
    }
}

export class Bite extends Ability {
    constructor(actor) {
        super(actor, 5, 2, 10)
    }
}

export class Haymaker extends Ability {
    constructor(actor) {
        super(actor, 3, 1, 30)
    }
}

export class Poison extends Ability {
    constructor(actor) {
        super(actor, 4, 2, 20)
    }
}

const abilities = [
    GrenadeLauncher,
    Shotgun,
    Magnum,
    Impale,
    Charge,
    Grab,
    Bite,
    Haymaker,
    Poison
]

