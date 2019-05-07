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


export class Action extends FakeActor {
    actor: Actor
    x: number
    y: number
    player: Player
    monster: Monster
    action: Action
    resolve: Function
    game: Game
    speed: number
    constructor(actor?: Actor) {
        super()
        this.actor = actor
        this.x = 0
        this.y = 0
        this.speed = 100
    }

    getSpeed() {
        return this.speed
    }

    executeParent(game: Game) {
        // console.log('executing', this)
    }
}