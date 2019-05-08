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
import { InfectAction } from './infectaction';

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
            // ????
            return new InfectAction(game.player, game)
        }

        return action
    }
}