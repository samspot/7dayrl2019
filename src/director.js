import * as ROT from 'rot-js'
import { Player } from './player.js'
import { Monster } from './monster.js'
import { Actor } from './actor.js'
import { debug } from 'util';
import Tyrant from 'assets/tyrant.json'
import Zombie from 'assets/zombie.json'
import Chimera from 'assets/chimera.json'
import Jill from 'assets/jill.json'
import Rogue from 'rot-js/lib/map/rogue';

const levels = [
    'lab',
    'catacombs',
    'outside',
    'guardhouse',
    'mansion'
]

const mobs = {
    'lab': [Zombie, Zombie, Chimera],
    'catacombs': [Zombie],
    'outside': [Zombie],
    'guardhouse': [Zombie],
    'mansion': [Zombie],
}

const bosses = {
    'lab': Jill,
    'catacombs': Tyrant,
    'outside': Tyrant,
    'guardhouse': Tyrant,
    'mansion': Tyrant
}


export class Director {
    constructor(game, scheduler) {
        this.player = game.player
        this.game = game
        this.countdown = 5

        this.scheduler = scheduler
        this.currentLevel = 0
        this.boss = null

    }

    // current level matters for monster gen
    levelchange(idx) {
        this.currentLevel = idx
    }

    tick() {
        if (!this.boss) {
            this.boss = bosses[levels[this.currentLevel]]
            this.createSchedule(this.boss)
        }

        this.debug()
        this.countdown--
        if (this.countdown <= 0) {
            let num = Math.abs(Math.floor(ROT.RNG.getNormal(0, 5)))
            if (num < 5) {
                num = 5
            }
            console.log("random", num)

            this.countdown = num

            let mobspec = this.generateMob()

            this.createSchedule(mobspec)
        }
    }

    createSchedule(mobspec) {
        let monster = this.game.createBeing(Monster,
            this.game.getFreeCells(), mobspec)

        console.dir("monster add", monster)

        this.scheduler.add(monster, true)
    }

    generateMob() {
        let mob = ROT.RNG.getItem(mobs[levels[this.currentLevel]])
        console.log(mob)
        return mob
    }

    debug() {
        // console.log(this.game.map)
        // let num = Math.abs(Math.floor(ROT.RNG.getNormal(0, 10)))
        // console.log("random", num)


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