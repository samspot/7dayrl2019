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
import { FakeActor } from './fakeactor';
import { Action } from './action';
import { MobSpec } from './MobSpec';

// 1. game.possesboss - updates some ui
// 2. remove the mob from the scheduler
// 3. if all bosses dead, win
function possessRescheduleInfect(player: Player, mob: Actor, game: Game, action: Action, resetScore: boolean) {
    console.log('possessRescheduleInfect', player, mob, action, resetScore)
    if (mob.isBoss()) {
        game.updateGameProgressPossess()
    }

    game.destroyMob(mob)

    player.becomeMob(mob)
}


// 1. reset score if true
// 2. remove event listeners from 'this', the action
// 3. mob.isRevive triggers a 'you revived in your original form message'
// 4. else call game.onBossDown() if mob is a boss with no hp
// 5. reschedule the mobs
function postInfectEventsMessages(player: Player, mob: Actor, game: Game, action: Action, resetScore: boolean) {
    console.log('postInfectEventsMessages', player, mob, action, resetScore)

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
        console.log('actions revive', player, mob)
        // it's a boss and the score is reset -- meaning player died.  so respawn as boss should kill boss
        if (mob.boss && resetScore) {
            game.onBossDown()
        }
    }

    game.showInfectable = false
    game.reschedule()

}

// action for infecting a target while still alive
export class InfectAbilityAction extends Action {
    constructor(player: Player, monster: Monster, action: Action) {
        super(player)
        this.player = player
        this.monster = monster
        this.action = action
    }

    execute(game: Game) {
        console.log('execute InfectAbilityAction on monster with hp', this.monster.hp)
        possessRescheduleInfect(this.player, this.monster, game, this, false)
        postInfectEventsMessages(this.player, this.monster, game, this, false)
    }
}


// action for handling input relevant to infecting a specific target.  Used on player death
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
        // mob.isRevive means self rez the player
        if (mob.isRevive) {
            console.log('calling player.revive() mob.isrevive true', mob)
            player.revive()
        } else {
            console.log('calling doInfect mob.isrevive false', mob)
            possessRescheduleInfect(player, mob, game, this, true)
        }

        window.removeEventListener("keydown", this)
        window.removeEventListener("keypress", this)
        // console.log("InfectAction PostInfect")
        postInfectEventsMessages(player, mob, game, this, true)
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