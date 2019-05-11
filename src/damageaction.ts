import * as _ from 'lodash';
import { Actor } from './actor';
import { Game } from './game';
import { DeadInfector } from './infectaction';

export function damageAction(actor: Actor, dmg: number, source: string, actorSource: Actor) {
    return function (game: Game) {
        let action = actor.damage(dmg)

        if (source) {
            let targetName = actor.name

            let sourceName = actorSource.name
            if (actor.isPlayer()) {
                targetName = 'Player'
            }
            // console.log('this.actorSource', this.actorSource)
            if (actorSource.isPlayer()) {
                sourceName = 'Player'
            }

            if (actor.boss && !actor.playerSeen()) {
            } else {
                game.dmgMessage(`${dmg} damage from ${source}`, false, sourceName, targetName, actorSource)
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