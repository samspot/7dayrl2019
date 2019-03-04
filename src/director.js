import * as ROT from 'rot-js'
import { Player } from './player.js'
import { Monster } from './monster.js'
import { Actor } from './actor.js'
import Tyrant from 'assets/tyrant.json'
import Zombie from 'assets/zombie.json'
import Chimera from 'assets/chimera.json'
import Config from './config.js'
import Hunter from 'assets/hunter.json'
import Spider from 'assets/spider.json'
import Lisa from 'assets/lisa.json'
import SpiderBoss from 'assets/spiderboss.json'
import Dog from 'assets/dog.json'
import Plant from 'assets/plant.json'
import Shark from 'assets/shark.json'
import Snake from 'assets/snake.json'
import Plant42 from 'assets/plant42.json'

import Jill from 'assets/jill.json'
import Chris from 'assets/chris.json'
import Barry from 'assets/barry.json'
import Brad from 'assets/brad.json'
import Wesker from 'assets/wesker.json'

const levels = [
    'lab',
    'catacombs',
    'outside',
    'guardhouse',
    'mansion'
]

const mobs = {
    'lab': [Zombie, Zombie, Chimera],
    'catacombs': [Zombie, Hunter, Spider, Spider, Zombie, Lisa, SpiderBoss],
    'outside': [Zombie, Dog, Dog, Plant, Spider],
    'guardhouse': [Zombie, Plant, Plant, Shark, Plant42],
    'mansion': [Zombie, Hunter, Hunter, Snake],
}

const bosses = {
    'lab': Jill,
    'catacombs': Chris,
    'outside': Barry,
    'guardhouse': Brad,
    'mansion': Wesker
}

export class Director {
    constructor(game, scheduler) {
        this.player = game.player
        this.game = game
        this.countdown = 5

        this.scheduler = scheduler
        // this.currentLevel = 0
        game.currentLevel = 0

        // this.resetLevel()
        this.boss = null
        this.mobs = []
        this.scheduler.add(this.player, true)
    }

    // cleanup all things that need to be cleaned for descending
    resetLevel(){
        console.log("director resetLevel()")
        this.game.resetLevel()
        this.boss = null
        this.mobs = []
        this.scheduler.clear()
        this.scheduler.add(this.player, true)
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

            this.game.getGameProgress().text = this.boss.name
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

        console.log(this.game.getGameProgress())
        console.log(this.game.gameProgress)

    }

    // debug the scheduler
    debugScheduler() {
        var turns = [];
        for (var i = 0; i < 20; i++) {
            var current = this.scheduler.next();
            turns.push(current.symbol);
        }
        console.dir("turn order " + turns.join(" "))
    }
}