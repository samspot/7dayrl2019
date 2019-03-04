import * as ROT from 'rot-js'
import { Player } from './player.js'
import { Monster } from './monster.js'
import { Actor } from './actor.js'
import Tyrant from 'assets/tyrant.json'
import Zombie from 'assets/zombie.json'
import Chimera from 'assets/chimera.json'
import Jill from 'assets/jill.json'
import Config from './config.js'

const levels = [
    'lab',
    'catacombs',
    'outside',
    'guardhouse',
    'mansion'
]

// TODO: mobs lvls 2-5
const mobs = {
    'lab': [Zombie, Zombie, Chimera],
    'catacombs': [Zombie],
    'outside': [Zombie],
    'guardhouse': [Zombie],
    'mansion': [Zombie],
}

// TODO: bosses lvls 2-5
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
        // this.currentLevel = 0
        game.currentLevel = 0
        this.boss = null

        this.mobs = []
    }

    // current level matters for monster gen
    levelchange(idx) {
        // this.currentLevel = idx
        game.currentLevel = idx
    }

    tick() {
        // load any mob changes
        this.mobs = this.game.mobs

        if (!this.boss) {
            this.boss = bosses[levels[this.game.currentLevel]]
            let monster = this.createSchedule(this.boss)
            monster.boss = true
            this.mobs.push(monster)
        }

        this.debug()
        this.countdown--
        if (this.countdown <= 0) {
            // let Config = { spawnrate: 10}
            let spawnrate = Config.spawnrate
            let minimum = Config.spawnrate / 2
            // let spawnrate = 10
            // let minimum = 5

            let num = Math.abs(Math.floor(ROT.RNG.getNormal(0, spawnrate)))
            if (num < minimum) {
                num = minimum 
            }
            // console.log("random", num)

            this.countdown = num

            let mobspec = this.generateMob()

            // TODO: add to array
            let monster = this.createSchedule(mobspec)
            this.mobs.push(monster)
        }

        // save any mob changes
        this.game.mobs = this.mobs
    }

    createSchedule(mobspec) {
        let monster = this.game.createBeing(Monster,
            this.game.getFreeCells(), mobspec)

        // console.dir("monster add", monster)

        this.scheduler.add(monster, true)

        return monster
    }

    generateMob() {
        let mob = ROT.RNG.getItem(mobs[levels[this.game.currentLevel]])
        // console.log(mob)
        // this.mobs.push(mob)
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
            turns.push(current._symbol);
        }
        console.dir("turn order " + turns.join(" "))
    }
}