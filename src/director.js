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


export class Director {
    constructor(game, scheduler) {
        this.player = game.player
        this.game = game
        this.countdown = 5

        this.scheduler = scheduler
        this.currentLevel = 0
    }

    // current level matters for monster gen
    levelchange(idx){
        this.currentLevel = idx
    }

    tick() {
        this.debug()
        this.countdown--
        if (this.countdown <= 0) {
            this.countdown = 5 

            let mobspec = this.generateMob()

            let monster = this.game.createBeing(Monster,
                this.game.getFreeCells(), mobspec)

            console.dir("monster add", monster)

            this.scheduler.add(monster, true)
        }
    }

    generateMob(){
        let mob = ROT.RNG.getItem(mobs[levels[this.currentLevel]])
        console.log(mob)
        return mob
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