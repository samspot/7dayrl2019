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

// 1. game.possesboss - updates some ui
// 2. remove the mob from the scheduler
// 3. if all bosses dead, win
function doInfect(player: Player, mob: Actor, game: Game, action: Action, resetScore: boolean) {
    console.log('doInfect', player, mob, action, resetScore)
    if (mob.isBoss()) {
        game.possesBoss()
    }

    _.remove(game.mobs, mob)
    game.scheduler.remove(mob)

    // if (game.allBossesDown()) {
    // game.win(action, resetScore)
    // if (resetScore) {
    //     game.resetScore()
    // }

    // // @ts-ignore
    // window.removeEventListener("keydown", action);
    // // @ts-ignore
    // window.removeEventListener("keypress", action);
    // console.log('all bosses down, you win action')
    // action.resolve(new YouWinAction(player))
    // }

    player.infectMob(mob)
}


// 1. reset score if true
// 2. remove event listeners from 'this', the action
// 3. mob.isRevive triggers a 'you revived in your original form message'
// 4. else call game.onBossDown() if mob is a boss with no hp
// 5. reschedule the mobs
function doPostInfect(player: Player, mob: Actor, game: Game, action: Action, resetScore: boolean) {
    console.log('doPostInfect', player, mob, action, resetScore)

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
        if (mob.boss && mob.hp > 0) {
            game.onBossDown()
        }
    }

    game.showInfectable = false
    game.reschedule()

    // if (game.allBossesDown()) {
    // game.win(action, resetScore)
    // }
}

export class InfectAbilityAction extends Action {
    constructor(player: Player, monster: Monster, action: Action) {
        super(player)
        this.player = player
        this.monster = monster
        this.action = action
    }

    execute(game: Game) {
        console.log('execute InfectAbilityAction on monster with hp', this.monster.hp)
        if (this.monster.hp <= this.player.str) {
            // console.log('executing InfectAbilityAction', this.monster.hp, this.monster)
            doInfect(this.player, this.monster, game, this, false)
            // console.log("infect ability action post infect")
            doPostInfect(this.player, this.monster, game, this, false)
        }
    }
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
            console.log('calling player.revive() mob.isrevive true', mob)
            player.revive()
        } else {
            console.log('calling doInfect mob.isrevive false', mob)
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