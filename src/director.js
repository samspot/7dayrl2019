import * as ROT from 'rot-js'
import { Player } from './player.js'
import { Pedro } from './pedro.js'
import { Actor } from './actor.js'
import { debug } from 'util';

export class Director {
    constructor(game, scheduler) {
        this.player = game.player
        this.game = game
        this.countdown = 5

        this.scheduler = scheduler
    }

    tick() {

        this.debug()
        this.countdown--
        if (this.countdown <= 0) {
            this.countdown = 10

            let pedro = this.game.createBeing(Pedro,
                this.game.getFreeCells())
            pedro.name = "pedro"

            console.dir("pedro", pedro)

            this.scheduler.add(pedro, true)
        }
    }

    debug() {
        // console.log(this.game.map)
    }

    // debug the scheduler
    debugScheduler() {
        var turns = [];
        for (var i = 0; i < 20; i++) {
            var current = this.scheduler.next();
            turns.push(current.name);
        }
        console.dir("\nGenerated order of actors:");
        console.dir(turns.join(" ") + " ...");
    }
}