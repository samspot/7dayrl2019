import * as ROT from 'rot-js'
import { keyMap } from './keymap.js'
import { Ability, Impale } from './abilities.js';
import { Game } from './game.js';
import Config from './config.js';

export class Action {
    constructor(actor) {
        this.actor = actor
    }

    executeParent(game) {
        // console.log('executing', this)
    }
}

export class InfectAbilityAction extends Action {
    constructor(player, monster, action) {
        super(player)
        this.player = player
        this.monster = monster
        this.action = action
    }

    execute(game) {
        if (this.monster.hp <= 0) {
            console.log('executing InfectAbilityAction', this.monster.hp, this.monster)
            doInfect(this.player, this.monster, game, this, false)
            // console.log("infect ability action post infect")
            doPostInfect(this.player, this.monster, game, this, false)
        }
    }
}

function doInfect(player, mob, game, action, resetScore) {

    if (mob.isBoss()) {
        game.possesBoss()
    }

    _.remove(game.mobs, mob)
    game.scheduler.remove(mob)

    if (game.allBossesDown()) {
        if (resetScore) {
            game.resetScore()
        }

        window.removeEventListener("keydown", action);
        window.removeEventListener("keypress", action);
        action.resolve(new YouWinAction())
    }

    player.infectMob(mob)
}

function doPostInfect(player, mob, game, action, resetScore) {

    game.dirty = true
    if (resetScore) {
        game.resetScore()
    }
    // game.gameDisplay.updateGui()
    window.removeEventListener("keydown", this);
    window.removeEventListener("keypress", this);

    if (mob.isRevive) {
        // console.log('doPostInfect', player, mob, action)
        game.message("You revived in your original form")
    } else {
        game.message("You infected " + player.name, false, player, mob)
    }

    game.reschedule()

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
        if (idx < 0) {
            console.log("invalid key")
            return
        }

        let game = this.game

        let mob
        let player = game.player

        if (parseInt(idx, 10)) {
            mob = game.getInfectableMobs()[idx - 1]
        }

        if (!mob) { return }

        // close modal. TODO less hacky solution
        // undie()
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
        // die()
        // this.game.gameDisplay.showModal('foo')
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

    execute(game) {
        //  let game = this.game
        game.message("You were killed.", true, undefined, game.player)
        if (game.getInfectableMobs().length === 0) {
            game.player.revive()
            game.message('You revive in your original form (no infectable monsters)', true)
            return
        }

        game.message("Choose a new body (enter number)", true, undefined, game.player)
        game.redraw()
        game.gameDisplay.drawMobs(true)
        game.gameDisplay.drawStatusBar()
        game.scheduler.clear()
        game.scheduler.add(new InfectAction(game.player, game))
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

            if (!this.actorSource) {
                console.log('dmg', this.dmg, 'source', this.source, 'actorsource', this.actorSource)
                console.log("ERRRORRRRR FIXIN'")
                this.actorSource = { name: 'Grue', isPlayer: () => false }
            }

            let sourceName = this.actorSource.name
            if (this.actor.isPlayer()) {
                targetName = 'Player'
            }
            // console.log('this.actorSource', this.actorSource)
            if (this.actorSource.isPlayer()) {
                sourceName = 'Player'
            }
            game.dmgMessage(`${this.dmg} damage from ${this.source}`, false, sourceName, targetName, this.actorSource)
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
        if (this.newX >=0 && this.newY >= 0) {
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
        if (game.levelBossPassed() || Config.debug) {
            game.currentLevel++

            if (game.currentLevel >= 5) {
                game.currentLevel--
                game.addScore(10000)
                return new YouWinAction()
            }

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
        // game.redraw()
        game.gameDisplay.updateGui()

        let highScores = JSON.parse(localStorage.getItem("highscores"))
        console.dir(highScores)
        if (!_.isArray(highScores)) { highScores = [] }
        highScores.push({ name: game.player.name, score: game.score })
        localStorage.setItem("highscores", JSON.stringify(highScores))


        let highScoreHtml = '<h2>High Scores</h2><ol>';
        highScores.sort((a, b) => b.score - a.score).forEach(s => {
            highScoreHtml += `<li>${s.name}: ${s.score}</li>`
        })
        highScoreHtml += '</ol>'


        // document.getElementById('modal-text').innerHTML = "<h1>You defeated the S.T.A.R.S!  Final Score " 
        let modalText = "<h1>You defeated the S.T.A.R.S!  Final Score "
            + game.score + "</h1>"
            + `<p>Try keeping the tyrant alive to improve your score!  Using your infect ability to possess enemies doesn't cost you points.</p>`
            // + `<p>Reload the page to try again!<p>`
            + `<p>${highScoreHtml}</p>`

        game.gameDisplay.showModal(modalText)
    }
}
