import * as _ from 'lodash';
import { Actor } from './actor';
import { Game } from './game';
import { DeadInfector } from './infectaction';

export function damageAction(target: Actor, dmg: number, attackName: string, dmgDealer: Actor) {
    return function (game: Game) {
        let hpBefore = target.hp
        let action = target.damage(dmg)
        let hpAfter = target.hp

        if (attackName) {
            let targetName = target.name

            let dmgDealerName = dmgDealer.name
            if (target.isPlayer()) {
                targetName = 'Player'
            }
            // console.log('this.actorSource', this.actorSource)
            if (dmgDealer.isPlayer()) {
                dmgDealerName = 'Player'
            }

            if (target.boss && !target.playerSeen()) {
            } else {
                game.dmgMessage(attackName, dmg, false, dmgDealerName, targetName, dmgDealer, hpBefore, hpAfter)
            }
        }

        if (game.player.hp <= 0) {
            game.deaths++
            onPlayerDeath(game)
        }

        return action
    }
}

function onPlayerDeath(game: Game) {
    game.showInfectable = true
    game.clearSchedule()
    let actor = new DeadInfector(game)
    game.schedule(actor, true)

    game.gameDisplay.updateGui()
}