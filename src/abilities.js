import * as ROT from 'rot-js'

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

    use() {
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
        console.log('no side effects')
    }

    canTargetEmpty(){
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

export class GrenadeLauncher extends Ability {
    constructor(actor) {
        super(actor, 10, 20, 30)
    }

    sideEffects(action, game) {
        console.log('boom')
        let sets = getCoordsAround(action.x, action.y)
        sets.forEach(s => {
            let {x, y} = s
            console.log(x, y)
            game.display.draw(s[0], s[1], "*", "red")

            let actor = game.getCharacterAt(null, s[0], s[1])
            if(actor){
                // make do damage fn real quick
                // TODO: does this need to be a damage action?
                console.log("damaging actor", actor, this.dmg/2)

                let action = actor.damage(this.dmg / 2)
                if(action){
                    throw "TODO: unhandled action in grenade launcher side effects"
                }
            }
        })
    }

    canTargetEmpty(){
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

export class Charge extends Ability {
    constructor(actor) {
        super(actor, 10, 10, 20)
    }
}

export class Grab extends Ability {
    constructor(actor) {
        super(actor, 2, 1, 10)
    }
}

const abilities = [
    GrenadeLauncher,
    Shotgun,
    Magnum,
    Impale,
    Charge,
    Grab
]

