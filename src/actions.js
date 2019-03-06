import * as ROT from 'rot-js'
import { keyMap } from './keymap.js'
import { Ability, Impale } from './abilities.js';
import { Game } from './game.js';

export class Action {
    constructor(actor) {
        this.actor = actor
    }

    executeParent(game) {
        // console.log('executing', this)
    }
}

// TODO use a modal for this later to make it more salient
export class InfectAction extends Action {
    constructor(actor, game) {
        super(actor)
        this.game = game
    }

    handleEvent(e) {
        // console.log('e', e)
        let charCode = e.which || e.keyCode
        let charStr = String.fromCharCode(charCode)

        let numberKeys = [
            ROT.KEYS.VK_0,
            ROT.KEYS.VK_1,
            ROT.KEYS.VK_2,
            ROT.KEYS.VK_3,
            ROT.KEYS.VK_4,
            ROT.KEYS.VK_5,
            ROT.KEYS.VK_6,
            ROT.KEYS.VK_7,
            ROT.KEYS.VK_8,
            ROT.KEYS.VK_9
        ]

        let idx = _.findIndex(numberKeys, x => x === charCode)
        if(idx < 0){
            console.log("invalid key")
            return
        }

        let game = this.game

        let mob
        let player = game.player
        if (game.getInfectableMobs(true).length === 0) {
            this.resolve(new GameOverAction())
        }


        if (parseInt(idx, 10)) {
            mob = game.getInfectableMobs()[idx - 1]
        }

        if (!mob) { return }

        if (mob.isBoss()) {
            game.possesBoss()
        }

        _.remove(game.mobs, mob)
        game.scheduler.remove(mob)

        if (game.allBossesDown()) {
            game.resetScore()
            return new YouWinAction()
        }

        player.name = mob.name
        player.hp = mob.maxHp * 1.5
        if(player.hp < 150){ player.hp = 150}
        player.color = mob.color
        player.str = mob.str
        player.x = mob.x
        player.y = mob.y
        player.sightRadius = mob.sightRadius
        player.boss = false

        player.abilities = []

        let hasImpale = false
        _.clone(mob.abilities).forEach(a => {
            // console.log('adding ability', a)
            a.actor = player
            player.addAbility(_.clone(a))
            if(a.constructor.name === 'Impale'){ hasImpale = true}
        })
        if(!hasImpale){
            player.addAbility(new Impale(player))
        }

        game.dirty = true
        game.resetScore()
        // game.gameDisplay.updateGui()
        window.removeEventListener("keydown", this);
        window.removeEventListener("keypress", this);

        game.message("you infected " + player.name, false, player, mob)

        game.reschedule()
        this.resolve()
    }

    act(){
        // console.log("InfectAction.act()")
        window.addEventListener("keydown", this);
        window.addEventListener("keypress", this);
        return new Promise(resolve => {
            this.resolve = resolve
        })
    }

    isPlayer(){
        return false
    }

    execute(game) {
        // console.log("InfectAction.execute()")
        game.message("You were killed.  You may choose to infect a weakened enemy.", true, undefined, game.player)
        game.message("Choose a new body (enter number)", true, undefined, game.player)
        game.redraw()
        game.gameDisplay.drawMobs(true)
        // game.redraw()
        game.scheduler.clear()
        game.scheduler.add(new InfectAction(game.player, game))
        // console.log(game.scheduler)
   }
}

export class DamageAction extends Action {
    constructor(actor, dmg, source, actorSource) {
        super(actor)
        this.dmg = dmg
        this.source = source
        this.actorSource = actorSource
    }

    execute(game) {
        let action = this.actor.damage(this.dmg)

        if (this.source) {
            let targetName = this.actor.name

            if(!this.actorSource){
                console.log('dmg', this.dmg, 'source', this.source, 'actorsource', this.actorSource)
                console.log("ERRRORRRRR FIXIN'")
                this.actorSource = {name: 'Grue', isPlayer: () => false} 
            }

            let sourceName = this.actorSource.name
            if(this.actor.isPlayer()){
                targetName = 'Player'
            }
            // console.log('this.actorSource', this.actorSource)
            if(this.actorSource.isPlayer()){
                sourceName = 'Player'
            }
            game.dmgMessage(`${this.dmg} damage from ${this.source}`, false, sourceName, targetName)
        }

        if (game.player.hp <= 0) {
            // console.log("returning new infect action")
            return new InfectAction(game.player)
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
        return new DamageAction(this.target, this.actor.str, `melee attack`, this.actor)
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

        // TODO: WTH is going on?  AbilityAction creator passing junk data?
        if(this.actor instanceof Game){
            this.actor = game.player
        }

        // console.log("AbilityAction this.actor", this.actor)
        if (actor) {
            let source = this.ability.constructor.name

            return new DamageAction(actor, this.ability.dmg, source, this.actor)
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
        alert("You were killed! No characters weak enough to infect! Game Over!")
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
