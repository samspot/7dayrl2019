import * as ROT from 'rot-js'
import { keyMap } from './keymap.js'
import { Ability } from './abilities.js';

export class Action {
    constructor(actor) {
        this.actor = actor
    }

    executeParent(game) {
        // console.log('executing', this)
    }
}

export class DamageAction extends Action {
    constructor(actor, dmg, source) {
        super(actor)
        this.dmg = dmg
        this.source = source
    }

    execute(game) {
        let action = this.actor.damage(this.dmg)

        console.log('source', this.source)
        if (this.source) {
            game.message(`You take ${this.dmg} damage from ${this.source}`)
        }


        if (game.player.hp <= 0) {
            game.message("You were killed.  You may choose to infect a weakened enemy within line of sight.")

            let mob
            let player = game.player
            setTimeout(() => {
                while (!mob) {
                    let idx = prompt("Choose a new body (enter number)")
                    if (parseInt(idx, 10)) {
                        mob = game.mobs[idx - 1]
                    }

                    if (!mob) { continue }

                    if (mob.isBoss()) {
                        game.possesBoss()
                    }

                    _.remove(game.mobs, mob)
                    game.scheduler.remove(mob)

                    if (game.allBossesDown()) {
                        game.resetScore()
                        return new YouWinAction()
                    }
                }
                player.name = mob.name
                player.hp = mob.hp
                player.color = mob.color
                player.str = mob.str
                player.x = mob.x
                player.y = mob.y
                player.boss = false
                // player.abilities = _.clone(mob.abilities)

                // console.log('player abilities', player.abilities)
                // console.log('mob abilities', mob, mob.abilities)

                player.abilities = []
                _.clone(mob.abilities).forEach(a => {
                    console.log('adding ability', a)
                    a.actor = player
                    player.addAbility(_.clone(a))
                })

                game.dirty = true
                game.resetScore()
                game.gameDisplay.updateGui()
            }, 0)
        }

        return action
    }
}

export class AttackAction extends Action {
    constructor(actor, target) {
        super(actor)
        this.target = target
    }

    execute(game) {
        return new DamageAction(this.target, this.actor.str, `${this.actor.name}'s melee attack`)
    }
}

export class MoveAction extends Action {
    constructor(actor, direction, newX, newY) {
        super(actor)
        this.direction = direction
        this.newX = newX
        this.newY = newY
    }

    execute(game) {
        this.executeParent(game)
        let actor = this.actor

        let newX, newY
        if (this.newX && this.newY) {
            newX = this.newX
            newY = this.newY
        }

        if (actor.isPlayer()) {
            var diff = ROT.DIRS[8][keyMap[this.direction]];
            newX = actor.x + diff[0];
            newY = actor.y + diff[1];

            // is the space in the map at all?
            var newKey = newX + "," + newY;
            if (!(newKey in game.map)) { return }
        }

        // collision here
        let character = game.getCharacterAt(actor, newX, newY)
        if (character) {
            return new AttackAction(actor, character)
        }

        game.display.draw(actor.x, actor.y, game.map[actor.x + "," + actor.y])
        actor.x = newX;
        actor.y = newY;
        actor.draw();
    }
}

export class PickupAction extends Action {
    constructor(actor) {
        super(actor)
    }

    execute(game) {
        // console.log("execute pickup action")
        this.executeParent(game)
        this.actor.checkBox()
    }
}

export class DescendAction extends Action {
    constructor(actor) {
        super(actor)
    }

    execute(game) {
        if (game.levelBossPassed()) {
            game.currentLevel++
            game.director.resetLevel()
            game.generateMap(game.director.getLevelSpec())
        }
    }
}

export class AbilityAction extends Action {
    constructor(actor, ability, x, y) {
        super(actor)
        this.ability = ability
        this.x = x
        this.y = y
    }

    execute(game) {
        this.ability.cooldown = this.ability.maxCooldown
        let actor = game.getCharacterAt(null, this.x, this.y)

        this.ability.sideEffects(this, game, actor)

        // console.log("executing ability action",
        //     this.ability, this.x, this.y, actor)

        if (actor) {
            return new DamageAction(actor, this.ability.dmg, `${this.actor.name}'s ${this.ability.constructor.name}`)
        }
    }
}

export class DefaultAction extends Action {
    constructor(actor) {
        super(actor)
    }

    execute(game) {
        return
    }
}

export class GameOverAction extends Action {
    constructor(actor) {
        super(actor)
    }

    execute(game) {
        game.gameOver = true
        alert("You were killed!  Game Over!")
    }
}

export class YouWinAction extends Action {
    constructor(actor) {
        super(actor)
    }

    execute(game) {
        game.gameOver = true
        alert("You defeated the S.T.A.R.S! Final Score " + game.score)
    }
}
