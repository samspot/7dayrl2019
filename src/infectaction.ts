import * as _ from 'lodash';
import { Actor, SimpleActor } from './actor';
import { Game } from './game';
import { Player } from './player';
import { numberKeys } from './keymap';

// 1. game.possesboss - updates some ui
// 2. remove the mob from the scheduler
// 3. if all bosses dead, win
function possessRescheduleInfect(player: Player, mob: Actor, game: Game, resetScore: boolean) {
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
function postInfectEventsMessages(player: Player, mob: Actor, game: Game, resetScore: boolean) {
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
export function infectAbilityAction(player: Player, monster: Actor) {
    return function (game: Game) {
        console.log('execute InfectAbilityAction on monster with hp', monster.hp - player.str)
        if (monster.hp - player.str <= 0) {
            possessRescheduleInfect(player, monster, game, false)
            postInfectEventsMessages(player, monster, game, false)
        }
    }
}


// action for handling input relevant to infecting a specific target.  Used on player death
export class DeadInfector extends SimpleActor {
    resolve: Function

    handleEvent(e: KeyboardEvent) {
        let charCode = e.which || e.keyCode

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
            possessRescheduleInfect(player, mob, game, true)
        }

        window.removeEventListener("keydown", this)
        window.removeEventListener("keypress", this)
        // console.log("InfectAction PostInfect")
        postInfectEventsMessages(player, mob, game, true)
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
}