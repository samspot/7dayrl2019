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
    game.message("You were killed.", true)
    if (game.getInfectableMobs().length === 0) {
        game.player.revive()
        game.message("You revived in your original form (no infectable monsters')", true)
        return
    }

    game.message("Choose a new body (enter number)", true)
    game.showInfectable = true
    game.scheduler.clear()
    let actor = new DeadInfector(game)
    game.scheduler.add(actor, true)
}