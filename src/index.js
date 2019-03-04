import _ from 'lodash';
import * as ROT from 'rot-js'
import { Game } from './game.js'
import { Director } from './director.js';

let scheduler = new ROT.Scheduler.Simple()
let game = new Game(scheduler)
game.init()

let director = new Director(game, scheduler)

async function mainLoop() {
    while (1) {
        let actor = scheduler.next()
        if (!actor) { break }
        // console.log("scheduled actor", actor)
        if (actor.isPlayer()) {
            game.updateGui()
        }

        let action = await actor.act()
        while(action){
            // console.log("got action", action)
            action = action.execute(game)
        }

        if (actor.isPlayer()) {
            director.tick()
        }
    }
}

mainLoop()

