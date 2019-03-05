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
        // console.log("ability tick")
        this.cooldown--
        if (this.cooldown < 0) { this.cooldown = 0 }
    }

    use() {
        // alert('used me ' + this.constructor.name)
        if (this.cooldown === 0) {
            this.cooldown = this.maxCooldown
            this.actor.useAbility(this)
            this.actor.tickAbilities()
            // return this.dmg
        }
    }

    inRange(position, target) {
        // TODO implement range
        return true
    }
}

export class GrenadeLauncher extends Ability {
    constructor(actor) {
        super(actor, 10, 20, 30)
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