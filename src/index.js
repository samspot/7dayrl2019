import _ from 'lodash';
import * as ROT from 'rot-js'
import {Game} from './game.js'
import DiscreteShadowcasting from 'rot-js/lib/fov/discrete-shadowcasting';

let scheduler = new ROT.Scheduler.Simple()
let game = new Game(scheduler)

game.init()

async function mainLoop(){
    while(1){
        let actor = scheduler.next()
        if(!actor) { break }
        console.log("scheduled actor", actor)
        await actor.act()
    }
}

mainLoop()

