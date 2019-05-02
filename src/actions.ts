import * as _ from 'lodash';
import * as ROT from 'rot-js';
import { Ability } from './abilities';
import { Actor } from './actor';
import Config from './config';
import { Game } from './game';
import { keyMap } from './keymap';
import { Monster } from './monster';
import { Player } from './player';
import { addScore } from './score';

export class Action {
    actor: Actor
    x: number
    y: number
    player: Player
    monster: Monster
    action: Action
    resolve: Function
    game: Game
    constructor(actor?: Actor) {
        this.actor = actor
        this.x = 0
        this.y = 0
    }

    executeParent(game: Game) {
        // console.log('executing', this)
    }
}

export class InfectAbilityAction extends Action {
    constructor(player: Player, monster: Monster, action: Action) {
        super(player)
        this.player = player
        this.monster = monster
        this.action = action
    }

    execute(game: Game) {
        if (this.monster.hp <= 0) {
            // console.log('executing InfectAbilityAction', this.monster.hp, this.monster)
            doInfect(this.player, this.monster, game, this, false)
            // console.log("infect ability action post infect")
            doPostInfect(this.player, this.monster, game, this, false)
        }
    }
}

function doInfect(player: Player, mob: Actor, game: Game, action: Action, resetScore: Boolean) {

    if (mob.isBoss()) {
        game.possesBoss()
    }

    _.remove(game.mobs, mob)
    game.scheduler.remove(mob)

    if (game.allBossesDown()) {
        if (resetScore) {
            game.resetScore()
        }

        // @ts-ignore
        window.removeEventListener("keydown", action);
        // @ts-ignore
        window.removeEventListener("keypress", action);
        action.resolve(new YouWinAction(player))
    }

    player.infectMob(mob)
}

function doPostInfect(player: Player, mob: Actor, game: Game, action: Action, resetScore: Boolean) {

    game.dirty = true
    if (resetScore) {
        game.resetScore()
    }
    window.removeEventListener("keydown", this);
    window.removeEventListener("keypress", this);

    if (mob.isRevive) {
        // console.log('doPostInfect', player, mob, action)
        game.message("You revived in your original form")
    } else {
        game.message("You infected " + player.name)
    }

    game.showInfectable = false
    game.reschedule()

}

export class InfectAction extends Action {
    constructor(actor: Actor, game: Game) {
        super(actor)
        this.game = game
    }

    handleEvent(e: InputEvent) {
        // @ts-ignore
        let charCode = e.which || e.keyCode
        let charStr = String.fromCharCode(charCode)

        let numberKeys = [
            //@ts-ignore
            ROT.KEYS.VK_0,
            //@ts-ignore
            ROT.KEYS.VK_1,
            //@ts-ignore
            ROT.KEYS.VK_2,
            //@ts-ignore
            ROT.KEYS.VK_3,
            //@ts-ignore
            ROT.KEYS.VK_4,
            //@ts-ignore
            ROT.KEYS.VK_5,
            //@ts-ignore
            ROT.KEYS.VK_6,
            //@ts-ignore
            ROT.KEYS.VK_7,
            //@ts-ignore
            ROT.KEYS.VK_8,
            //@ts-ignore
            ROT.KEYS.VK_9
        ]

        let idx = _.findIndex(numberKeys, x => x === charCode)
        if (idx < 0) {
            console.log("invalid key")
            return
        }

        let game = this.game

        let mob
        let player = game.player

        mob = game.getInfectableMobs()[idx - 1]

        if (!mob) { return }

        game.gameDisplay.hideModal()
        if (mob.isRevive) {
            player.revive()
        } else {
            doInfect(player, mob, game, this, true)
        }

        window.removeEventListener("keydown", this)
        window.removeEventListener("keypress", this)
        // console.log("InfectAction PostInfect")
        doPostInfect(player, mob, game, this, true)
        this.resolve()
    }

    act() {
        // console.log("InfectAction.act()")
        window.addEventListener("keydown", this);
        window.addEventListener("keypress", this);

        // open modal. TODO less hacky solution
        let modalText = 'You Died and your score was reset to 0.' +
            ' Press a number key to select a character to infect. Umbrella shall never die!'
        this.game.gameDisplay.showModal(modalText)
        return new Promise(resolve => {
            this.resolve = resolve
        })
    }

    isPlayer() {
        return false
    }

    execute(game: Game) {
        game.message("You were killed.", true)
        if (game.getInfectableMobs().length === 0) {
            game.player.revive()
            game.message('You revive in your original form (no infectable monsters)', true)
            return
        }

        game.message("Choose a new body (enter number)", true)
        game.redraw()
        game.showInfectable = true
        game.gameDisplay.updateGui()
        game.scheduler.clear()
        game.scheduler.add(new InfectAction(game.player, game), false)
    }
}

export class DamageAction extends Action {
    dmg: number
    source: string
    actorSource: Actor
    constructor(actor: Actor, dmg: number, source: string, actorSource: Actor) {
        super(actor)
        this.dmg = dmg
        this.source = source
        this.actorSource = actorSource
    }

    execute(game: Game) {
        let action = this.actor.damage(this.dmg)

        if (this.source) {
            let targetName = this.actor.name

            let sourceName = this.actorSource.name
            if (this.actor.isPlayer()) {
                targetName = 'Player'
            }
            // console.log('this.actorSource', this.actorSource)
            if (this.actorSource.isPlayer()) {
                sourceName = 'Player'
            }

            if (this.actor.boss && !this.actor.playerSeen()) {
            } else {
                game.dmgMessage(`${this.dmg} damage from ${this.source}`, false, sourceName, targetName, this.actorSource)
            }
        }

        if (game.player.hp <= 0) {
            game.deaths++
            return new InfectAction(game.player, game)
        }

        return action
    }
}

export class AttackAction extends Action {
    target: Actor
    constructor(actor: Actor, target: Actor) {
        super(actor)
        this.target = target
    }

    execute(game: Game) {
        return new DamageAction(this.target, this.actor.str, `melee attack`, this.actor)
    }
}

export class MoveAction extends Action {
    direction: string
    newX: number
    newY: number
    constructor(actor: Actor, direction: string, newX: number, newY: number) {
        super(actor)
        this.direction = direction
        this.newX = newX
        this.newY = newY
    }

    execute(game: Game) {
        this.executeParent(game)
        let actor = this.actor

        let newX, newY
        if (this.newX >= 0 && this.newY >= 0) {
            newX = this.newX
            newY = this.newY
        }

        if (actor.isPlayer()) {
            // @ts-ignore
            var diff = ROT.DIRS[8][keyMap[this.direction]];
            newX = actor.x + diff[0];
            newY = actor.y + diff[1];

            // is the space in the map at all?
            var newKey = newX + "," + newY;
            if (!(newKey in game.map)) { return }
        }

        let character = game.getCharacterAt(actor, newX, newY)
        // console.log(`spawn-${actor.spawnId} ${actor.x},${actor.y} moving to ${this.newX},${this.newY} blocked by ${character}`)
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
    constructor(actor: Actor) {
        super(actor)
    }

    execute(game: Game) {
        // console.log("execute pickup action")
        this.executeParent(game)
    }
}

export class DescendAction extends Action {
    constructor(actor: Actor) {
        super(actor)
    }

    execute(game: Game) {
        if (game.levelBossPassed() || Config.debug) {
            game.currentLevel++

            if (game.currentLevel >= 5) {
                game.currentLevel--
                return new YouWinAction(this.actor)
            }

            game.director.resetLevel()
            game.generateMap(game.director.getLevelSpec())

        }
    }
}

export class AbilityAction extends Action {
    ability: Ability
    constructor(actor: Actor, ability: Ability, x: number, y: number) {
        super(actor)
        this.ability = ability
        this.x = x
        this.y = y
    }

    execute(game: Game) {
        this.ability.cooldown = this.ability.maxCooldown
        let actor = game.getCharacterAt(null, this.x, this.y)

        this.ability.sideEffects(this, game, actor)

        // console.log("executing ability action",
        //     this.ability, this.x, this.y, actor)

        // TODO: WTH is going on?  AbilityAction creator passing junk data?
        if (this.actor instanceof Game) {
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
    constructor() {
        super()
    }

    execute(game: Game) {
        return
    }
}

export class GameOverAction extends Action {
    constructor(actor: Actor) {
        super(actor)
    }

    execute(game: Game) {
        game.gameOver = true
        alert("You were killed! No characters weak enough to infect! Game Over!")
    }
}

export class YouWinAction extends Action {
    constructor(actor: Actor) {
        super(actor)
    }

    execute(game: Game) {
        game.gameOver = true
        game.gameDisplay.updateGui()

        let highScores = addScore(game.player.name, game.score)

        let highScoreHtml = '<h2>High Scores</h2><ol>';
        highScores.sort((a, b) => b.score - a.score).forEach(s => {
            highScoreHtml += `<li>${s.name}: ${s.score}</li>`
        })
        highScoreHtml += '</ol>'


        let modalText = "<h1>You defeated the S.T.A.R.S!  Final Score "
            + game.score + "</h1>"
            + `<p>Try keeping the tyrant alive to improve your score!  Using your infect ability to possess enemies doesn't cost you points.</p>`
            + `<p>${highScoreHtml}</p>`

        game.gameDisplay.showModal(modalText)
    }
}
