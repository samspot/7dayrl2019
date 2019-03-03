import * as ROT from 'rot-js'
import {Player} from './player.js'
import {Pedro} from './pedro.js'
import {Actor} from './actor.js'
import { debug } from 'util';

export class Director {
    constructor(player, game){
        this.player = player
        this.game = game
        this.countdown = 5

        this.scheduler = new ROT.Scheduler.Simple()
        this.scheduler.add(this.player, true)
    }

    tick(){

        this.debug()
        this.countdown--
        if(this.countdown <= 0){
            this.countdown = 5000

            let pedro = this.game.createBeing(Pedro, 
                this.game.getFreeCells())

            this.scheduler.add(pedro)
        }
    }

    debug(){
        // console.log(this.game.map)
    }
}