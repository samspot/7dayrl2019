import * as _ from 'lodash';
import * as ROT from 'rot-js';
import { Action, DamageAction, InfectAbilityAction } from './actions';
import { Actor } from './actor';
import { Game } from './game';
import { IGameMap } from './maps';
import { getCoordsAround } from './Level';
import { Stunned } from './status';

export class Ability {
    actor: Actor
    maxCooldown: number
    cooldown: number
    range: number
    dmg: number
    description: string
    constructor(actor: Actor, cooldown: number, range: number, dmg: number) {
        this.actor = actor
        this.maxCooldown = cooldown
        this.cooldown = 0
        this.range = range
        this.dmg = dmg
        this._use = this._use.bind(this)
    }

    tick() {
        this.cooldown--
        if (this.cooldown < 0) { this.cooldown = 0 }
    }

    _use(e: InputEvent) {
        e.preventDefault()
        this.actor.useAbility(this)
    }

    getRandomAbility() {
        //@ts-ignore
        let a: Ability = ROT.RNG.getItem(abilities)
        return a
    }

    sideEffects(action: Action, game: Game, actor: Actor) {
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

function isTrapped(map: IGameMap, x: number, y: number) {
    let trapped = _.map(getCardinalCoords(x, y), coordlist => {
        return map[coordlist[0] + ',' + coordlist[1]] !== '.'
    })
    return _.every(trapped)
}

export interface ISchedule {
    act: () => any
    isPlayer: () => boolean
    getSpeed: () => number
    framesLeft: () => number
}

class FakeActor {
    isPlayer() {
        return false
    }

    getSpeed() {
        return 100
    }

    framesLeft() {
        return 0
    }
}

class ScheduledDamage extends FakeActor implements ISchedule {
    target: Actor
    dmg: number
    text: string
    constructor(target: Actor, dmg: number, text: string) {
        super()
        this.target = target
        this.dmg = dmg
        this.text = text
    }

    act() {
        return new DamageAction(this.target, this.dmg, this.text, this.target)
    }

}


class AnimationAction extends FakeActor implements ISchedule {
    symbol: string
    frames: number
    coords: Array<Array<number>>
    game: Game
    constructor(frames: number, coords: Array<Array<number>>, symbol: string, game: Game) {
        super()
        this.symbol = symbol
        this.frames = frames
        this.coords = coords
        this.game = game


    }

    framesLeft() {
        return this.frames
    }

    act() {
        if (this.frames > 0) {
            this.frames--
            // console.log('drawing', this.frames)

            this.coords.forEach(s => {
                this.game.display.draw(s[0], s[1], ['.', this.symbol])
                // console.log('drawing', this.frames, s[0], s[1])
            })
        }
    }

    execute() {
        return this.act()
    }
}

export class Suplex extends Ability {
    constructor(actor: Actor) {
        // super(actor, 8, 1, 40)//40)
        super(actor, 6, 1, 20)//40)
        this.description = `Pick up the target and slam them behind you, doing ${this.dmg} damage to the target and ${this.dmg / 2} to any creature in the impact zone.`
    }

    sideEffects(action: Action, game: Game, target: Actor) {
        let source = this.actor
        let pos = getPositions(source, target)

        let newX = pos.sourceRear.x
        let newY = pos.sourceRear.y

        let occupant = game.getCharacterAt(null, newX, newY)

        target.x = newX
        target.y = newY
        game.map[newX + ',' + newY] = '.'

        if (occupant) {
            console.log('suplex damaging occupant', occupant)
            game.scheduler.add(new ScheduledDamage(occupant, this.dmg / 2, `crushed by ${this.actor.name} Suplex`), false)
            game.fixActorOverlap(target)
        }


        // console.log(`side effects put target in (${newX}, ${newY}) for source at (${source.x}, ${source.y})`, this, target)
        // console.log(`map[${newX},${newY}] is ${game.map[newX + ',' + newY]}`)
    }
}


export class Grab extends Ability {
    constructor(actor: Actor) {
        let range = 3
        super(actor, 2, range, 10)
        this.description = `Grab a target ${range} squares away and pull them to you. `
            + `Brushes aside anyone in between.`
    }

    sideEffects(action: Action, game: Game, actor: Actor) {

        let source = this.actor
        let target = actor

        // push original occupant to targets original loc
        let pos = getPositions(source, target)
        let xloc = pos.sourceFront.x
        let yloc = pos.sourceFront.y
        console.log('x', xloc, 'y', yloc)

        // TODO: combine getcharacterat, fixactoroverlap, and map carving below
        let occupant = game.getCharacterAt(null, xloc, yloc)
        if (occupant) {
            // console.log('occupant is', occupant, 'fixing overlap')
            game.fixActorOverlap(target)
        }

        // move target to that square
        target.x = xloc
        target.y = yloc
        game.map[xloc + ',' + yloc] = '.'

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

function knockBack(source: Actor, target: Actor, game: Game) {

    let pos = getPositions(source, target)
    target.x = pos.targetRear.x
    target.y = pos.targetRear.y
    game.map[target.x + ',' + target.y] = '.'

    console.log('pos', pos.direction[0], pos)

    let x = target.x
    let y = target.y
    let sets = []
    switch (pos.direction[0]) {
        case 'N':
        case 'S':
            sets.push([x, y])
            sets.push([x - 1, y])
            sets.push([x + 1, y])
            sets.push([x, y + 1])
            break;
        case 'W':
        case 'E':
            sets.push([x, y - 1])
            sets.push([x, y + 1])
            sets.push([x, y])
            sets.push([x + 1, y])
            break;
    }

    // let sets: any = [][]
    game.gameDisplay.addAnimation(new AnimationAction(2, sets, '*', game))
}

export class Charge extends Ability {
    constructor(actor: Actor) {
        super(actor, 10, 10, 20)
    }

    sideEffects(action: Action, game: Game, actor: Actor) {
        console.log('Charge.sideEffects called with', action, actor, this.actor)

        let source = this.actor
        let target = actor

        if (actor) {
            //constructor(x: number, y: number, symbol: string, color: string, game: Game) {
            //let foo = new Actor(action.x, action.y, '@', 'red', game)

            knockBack(source, target, game)
            //console.log('x', xloc, pos.close.x, 'y', yloc, pos.close.y)
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

    mobsGetSideEffects() {
        // TODO: put charge logic here - maybe.  what happens if mobs charge but don't get to knockbak the player? do they just get moved next to them?
        return true
    }
}

export class Infect extends Ability {
    constructor(actor: Actor) {
        // same damage as melee for this character - use this.str
        let infectStr = actor.str
        if (infectStr < 20) { infectStr = 20 }
        super(actor, 1, 3, infectStr)
        this.description = 'Infect does your melee damage to the target, and if the target dies on this turn then you will take control of them.'
    }

    // action.actor - player
    // actor - monster
    // most actions just run their execute(game) method
    sideEffects(action: Action, game: Game, actor: Actor) {
        console.log("infect", action, game, actor)
        game.scheduler.add({
            act: () => {
                // @ts-ignore
                return new InfectAbilityAction(action.actor, actor, action)
            },
            isPlayer: () => false,
            getSpeed: () => 100
        }, false)
    }
}

export class GrenadeLauncher extends Ability {
    constructor(actor: Actor) {
        super(actor, 10, 20, 30)
    }

    sideEffects(action: Action, game: Game) {
        let sets = getCoordsAround(action.x, action.y)
        sets.forEach(s => {
            setTimeout(() => {
                game.dirty = true
            }, 0)

            let actor = game.getCharacterAt(null, s[0], s[1])
            if (actor) {

                game.scheduler.add(new ScheduledDamage(actor, this.dmg / 2,
                    `${this.actor.name} Grenade Splash Damage`), false)
            }
        })
        game.gameDisplay.addAnimation(new AnimationAction(5, sets, '*', game))
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

    sideEffects(action: Action, game: Game, target: Actor) {
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

    sideEffects(action: Action, game: Game, target: Actor) {
        // let poisonDamage = (target.hp - this.dmg) / 2
        let poisonDamage = target.hp / 2
        game.scheduler.add(new ScheduledDamage(target, poisonDamage, `${this.actor.name} Poison Damage`), false)
    }
}
export class Crossbow extends Ability {
    constructor(actor: Actor) {
        super(actor, 9, 10, 30)
        this.description = `Stuns the target for 1 turn`
    }

    sideEffects(action: Action, game: Game, target: Actor) {
        target.addStatus(new Stunned())
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

    sideEffects(action: Action, game: Game, target: Actor) {
        target.addStatus(new Stunned())
        knockBack(this.actor, target, game)
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

