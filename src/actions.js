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
    constructor(actor, dmg){
        super(actor)
        this.dmg = dmg
    }

    execute(game){
        let action = this.actor.damage(this.dmg)

        if (game.player.hp <= 0) {
            let mob
            let player = game.player
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

            player.abilities = []
            _.clone(mob.abilities).forEach(a => {
                console.log('adding ability', a)
                a.actor = player
                player.addAbility(_.clone(a))
            })

            console.log('player abilities', player.abilities)
            // console.log('mob abilities', mob.abilities)
            game.redraw()
            // player.draw()
            game.resetScore()
            // console.log("after attack player", player)

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

        // alert('attack ' + this.actor.out() + ' against ' + this.target.out())
        // if(action){ return action }

        // let action = this.target.damage(this.actor.str)
        // return action

        return new DamageAction(this.target, this.actor.str)

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
            // console.log("Descend pressed and allowed")

            // game.generateMap()
            game.currentLevel++
            game.director.resetLevel()
            game.generateMap()
            // TODO descend
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


        this.ability.sideEffects(this, game)

        // console.log("executing ability action",
        //     this.ability, this.x, this.y, actor)


        // let action = this.target.damage(this.actor.str)
        // if(action){ return action }

        let action

        if (actor) {
            action = actor.damage(this.ability.dmg)
            // actor.hp -= this.ability.dmg
            // if (actor.hp <= 0 && !actor.isPlayer()) {
            //     game.destroyMob(actor)
            // }
        }

        if(action) { return action }
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
