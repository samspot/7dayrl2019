import _ from 'lodash';
import * as ROT from 'rot-js'
import {Game} from './game.js'
import { Director } from './director.js';

let scheduler = new ROT.Scheduler.Simple()
let game = new Game(scheduler)
game.init()

let director = new Director(game, scheduler)

async function mainLoop(){
    while(1){
        let actor = scheduler.next()
        if(!actor) { break }
        console.log("scheduled actor", actor)
        await actor.act()
        director.tick()
    }
}

mainLoop()

