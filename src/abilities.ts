import * as _ from 'lodash';
import { Actor, SimpleActor } from './actor'
import { Game } from './game';
import { IGameMap } from './maps';
import { getCoordsAround } from './Level';
import { Stunned } from './status';
import { damageAction } from './damageaction';
import { infectAbilityAction } from './infectaction'
import { Player } from './player';
import { getRandItem } from './random';
import Config from './config';

export function createAbility(actor: Actor, ability: Ability) {
    return new Ability(actor, ability.cooldown, ability.range, ability.dmg)
}

export class Ability {
    actor: Actor
    maxCooldown: number
    cooldown: number
    range: number
    dmg: number
    description: string
    name: string
    constructor(actor: Actor, cooldown: number, range: number, dmg: number) {
        this.actor = actor
        this.maxCooldown = cooldown
        this.cooldown = 0
        this.range = range
        this.dmg = dmg
        this._use = this._use.bind(this)
        this.name = this.constructor.name
    }

    tick() {
        this.cooldown--
        if (this.cooldown < 0) { this.cooldown = 0 }
    }

    _use(e: InputEvent) {
        e.preventDefault()
        this.actor.useAbility(this)
    }

    getRandomAbility(): Ability {
        return getRandItem(abilities)
    }

    sideEffects(game: Game, actor: Actor, x: number, y: number) {
        // console.log('no side effects')
    }

    canTargetEmpty() {
        return false
    }

    mobsGetSideEffects() {
        return true
    }
}

export class EmptySlot extends Ability {
    constructor(actor: Actor) {
        super(actor, 0, 1, 0)
    }
}

interface ICardinalCoords {
    [key: string]: Array<number>
}

function getCardinalCoords(x: number, y: number) {
    let c: ICardinalCoords = {
        N: [x, y - 1],     // N
        E: [x + 1, y],     // E
        S: [x, y + 1],     // S
        W: [x - 1, y],     // W
    }
    return c
}


// suplex needs to check this
// call this on attempted move

function isTrapped(map: IGameMap, x: number, y: number) {
    let trapped = _.map(getCardinalCoords(x, y), coordlist => {
        let [x, y] = coordlist
        let value = map[x + ',' + y]
        // console.log('check trapped value', x, y, value)
        return value !== '.'
    })
    return _.every(trapped)
}

class ScheduledDamage extends SimpleActor {
    source: Actor
    target: Actor
    dmg: number
    text: string
    constructor(source: Actor, target: Actor, dmg: number, text: string, game: Game) {
        super(game)
        this.source = source
        this.target = target
        this.dmg = dmg
        this.text = text
    }

    act() {
        return damageAction(this.target, this.dmg, this.text, this.source)
    }

}

function animationActor(frames: number, actor: Actor, symbol: string, game: Game) {
    return function () {
        if (frames >= 0) {
            game.display.draw(actor.x, actor.y, ['.', symbol])
            return animationActor(frames - 1, actor, symbol, game)
        }
    }
}

function animation(frames: number, coords: Array<Array<number>>, symbol: string, game: Game) {
    return function () {
        if (frames >= 0) {
            coords.forEach(s => game.display.draw(s[0], s[1], ['.', symbol]))
            return animation(frames - 1, coords, symbol, game)
        }
    }
}

export class Suplex extends Ability {
    constructor(actor: Actor) {
        super(actor, 6, 1, 20)
        this.description = `Pick up the target and slam them behind you, doing ${this.dmg} damage to the target and ${this.dmg / 2} to any creature in the impact zone.`
    }

    sideEffects(game: Game, target: Actor) {
        let source = this.actor
        let pos = getPositions(source, target)

        let newX = pos.sourceRear.x
        let newY = pos.sourceRear.y

        let occupant = game.getCharacterAt(null, newX, newY)

        repositionActor(target, newX, newY, game)


        if (occupant) {
            // console.log('suplex damaging occupant', occupant)
            game.schedule(new ScheduledDamage(source, occupant, this.dmg / 2, `crushed by ${this.actor.name} Suplex`, game), false)
            game.fixActorOverlap(target)
        }


        // console.log(`side effects put target in (${newX}, ${newY}) for source at (${source.x}, ${source.y})`, this, target)
        // console.log(`map[${newX},${newY}] is ${game.map[newX + ',' + newY]}`)
    }
}


export class Grab extends Ability {
    constructor(actor: Actor) {
        let range = 1

        if (actor.isPlayer()) {
            range = 3
        }

        super(actor, 2, range, 10)
        this.description = `Grab a target ${range} squares away and pull them to you. `
            + `Brushes aside anyone in between.`
    }

    sideEffects(game: Game, actor: Actor) {

        let source = this.actor
        let target = actor

        let originalPos = target.x + ',' + target.y

        // push original occupant to targets original loc
        let pos = getPositions(source, target)
        let xloc = pos.sourceFront.x
        let yloc = pos.sourceFront.y
        // console.log('x', xloc, 'y', yloc)

        // TODO: combine getcharacterat, fixactoroverlap, and map carving below
        let occupant = game.getCharacterAt(null, xloc, yloc)
        if (occupant) {
            // console.log('occupant is', occupant, 'fixing overlap')
            game.fixActorOverlap(target)
        }

        repositionActor(target, xloc, yloc, game)

        // game.message(`Grab moved ${target.name} from ${originalPos} to ${newPos}`)

        // console.log(`side effects put target in (${xloc}, ${yloc}) for source at (${source.x}, ${source.y})`, this, target)
        // console.log(`map[${xloc},${yloc}] is ${game.map[xloc + ',' + yloc]}`)

    }

    canTargetEmpty() {
        return false
    }

    mobsGetSideEffects() {
        return false
    }
}

function getPositions(source: Actor, target: Actor) {
    let xdiff = source.x - target.x
    let ydiff = source.y - target.y

    let closeX = source.x
    let closeY = source.y

    let sourceFront = { x: source.x, y: source.y }
    let sourceRear = { x: source.x, y: source.y }
    let targetFront = { x: target.x, y: target.y }
    let targetRear = { x: target.x, y: target.y }

    let farX = source.x
    let farY = source.y

    let direction = ''

    if (ydiff > 0) { // target north of source
        //console.log('target north y is', target.y)
        sourceFront.y = source.y - 1
        sourceRear.y = source.y + 1
        targetRear.y = target.y - 1
        targetFront.y = target.y + 1
        direction += 'N'
    }

    if (ydiff < 0) { // target south of source
        //console.log('target south y is', target.y)
        sourceFront.y = source.y + 1
        sourceRear.y = source.y - 1
        targetRear.y = target.y + 1
        targetFront.y = target.y - 1
        direction += 'S'
    }

    if (xdiff > 0) { // target is west of source
        //console.log('target west x is', target.x)
        sourceFront.x = source.x - 1
        sourceRear.x = source.x + 1
        targetRear.x = target.x - 1
        targetFront.x = target.x + 1
        direction += 'W'
    }

    if (xdiff < 0) { // target is east of source
        //console.log('target east x is', target.x)
        sourceFront.x = source.x + 1
        sourceRear.x = source.x - 1
        targetRear.x = target.x + 1
        targetFront.x = target.x - 1
        direction += 'E'
    }

    let pos = {
        sourceFront,
        sourceRear,
        targetFront,
        targetRear,
        direction
    }

    // console.log(`getPositions result ${pos} sourceFront`, sourceFront, 'sourceRear', sourceRear, 'targetFront', targetFront, 'targetRear', targetRear)
    return pos
}

function repositionActor(actor: Actor, x: number, y: number, game: Game) {
    if (x < 0) {
        x = 0
    }

    if (x >= Config.gamePortWidth) {
        x = Config.gamePortWidth - 1
    }

    if (y < 0) {
        y = 0
    }

    if (y >= Config.gamePortHeight) {
        y = Config.gamePortHeight - 1
    }

    actor.x = x
    actor.y = y
    game.map[x + ',' + y] = '.'

    if (isTrapped(game.map, x, y)) {
        let cardinals = getCardinalCoords(x, y)
        // console.log('actor is trapped, hollow', cardinals, actor)
        Object.keys(cardinals).forEach(k => {
            let x = cardinals[k][0]
            let y = cardinals[k][1]

            if (inBounds(x, y, game.map)) {
                game.map[x + ',' + y] = '.'

            }
        })
    }
}

function inBounds(x: number, y: number, map: IGameMap) {
    return x > 0 && y > 0 && x < Config.gamePortWidth && y < Config.gamePortHeight
}


function knockBack(source: Actor, target: Actor, game: Game) {
    let x = target.x
    let y = target.y

    let pos = getPositions(source, target)

    repositionActor(target, pos.targetRear.x, pos.targetRear.y, game)


    let sets = []
    switch (pos.direction[0]) {
        case 'N':
        case 'S':
            // sets.push([x, y])
            // sets.push([x - 1, y])
            // sets.push([x + 1, y])
            // sets.push([x, y + 1])
            break;
        case 'W':
        case 'E':
            // sets.push([x, y - 1])
            // sets.push([x, y + 1])
            // sets.push([x + 1, y])
            break;
    }

    sets.push([x, y])
    game.gameDisplay.addAnimation(animation(2, sets, '*', game))
}

export class Charge extends Ability {
    constructor(actor: Actor) {
        super(actor, 10, 10, 20)
    }

    sideEffects(game: Game, actor: Actor, x: number, y: number) {
        // console.log('Charge.sideEffects called with', actor, this.actor)

        let source = this.actor
        let target = actor

        if (actor) {
            knockBack(source, target, game)
            //console.log('x', xloc, pos.close.x, 'y', yloc, pos.close.y)
        }

        repositionActor(source, x, y, game)
    }

    canTargetEmpty() {
        return true
    }

    mobsGetSideEffects() {
        // TODO: put charge logic here - maybe.  what happens if mobs charge but don't get to knockbak the player? do they just get moved next to them?
        return true
    }
}

export class Infect extends Ability {
    player: Player
    constructor(actor: Player) {
        super(actor, 1, 3, actor.getInfectStr())
        this.description = 'Infect does your melee damage to the target, and if the target dies on this turn then you will take control of them.'
        this.player = actor
    }

    // action.actor - player
    // actor - monster
    // most actions just run their execute(game) method
    sideEffects(game: Game, target: Actor) {
        infectAbilityAction(this.player, target)(game)
    }
}

export class GrenadeLauncher extends Ability {
    constructor(actor: Actor) {
        super(actor, 10, 20, 30)
    }

    sideEffects(game: Game, actor: Actor, x: number, y: number) {
        let sets = getCoordsAround(x, y)
        sets.forEach(s => {
            let actor = game.getCharacterAt(null, s[0], s[1])
            if (actor) {

                game.schedule(new ScheduledDamage(this.actor, actor, this.dmg / 2,
                    `${this.actor.name} Grenade Splash Damage`, game), false)
            }
        })
        game.gameDisplay.addAnimation(animation(2, sets, '*', game))
    }

    canTargetEmpty() {
        return true
    }
}

export class Shotgun extends Ability {
    constructor(actor: Actor) {
        super(actor, 4, 5, 20)
        this.description = "Knocks back the target"
    }

    sideEffects(game: Game, target: Actor) {
        // knock them back 2 squares
        // knockBack(this.actor, target, game)
        knockBack(this.actor, target, game)
    }
}

export class Poison extends Ability {
    constructor(actor: Actor) {
        super(actor, 6, 1, 1)
        this.description = `Cut target hp in half, then do ${this.dmg} damage`
    }

    sideEffects(game: Game, target: Actor) {
        let poisonDamage = target.hp / 2
        damageAction(target, poisonDamage, 'Poison Tick', this.actor)(game)
    }
}
export class Crossbow extends Ability {
    constructor(actor: Actor) {
        super(actor, 9, 10, 30)
        this.description = `Stuns the target for 1 turn`
    }

    sideEffects(game: Game, target: Actor, x: number, y: number) {
        target.addStatus(new Stunned())
        game.gameDisplay.addAnimation(animationActor(5, target, '!', game))
    }
}

export class Magnum extends Ability {
    constructor(actor: Actor) {
        super(actor, 6, 10, 50)
    }
}

export class Impale extends Ability {
    constructor(actor: Actor) {
        super(actor, 5, 1, 40)
    }
}

export class Bite extends Ability {
    constructor(actor: Actor) {
        super(actor, 5, 1, 20)
    }
}

export class Haymaker extends Ability {
    constructor(actor: Actor) {
        super(actor, 8, 1, 30)
        this.description = `Stuns the target for 1 turn and knocks them back`
    }

    sideEffects(game: Game, target: Actor, x: number, y: number) {
        target.addStatus(new Stunned())
        knockBack(this.actor, target, game)
        game.gameDisplay.addAnimation(animationActor(5, target, '!', game))
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
    Poison,
    Suplex,
    Crossbow
]

