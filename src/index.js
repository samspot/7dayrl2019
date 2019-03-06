import _ from 'lodash'
import * as ROT from 'rot-js'
import { Game } from './game.js'
import { Director } from './director.js'
import Config from './config.js'

if(Config.seed){
    ROT.RNG.setSeed(Config.seed)
}

let scheduler = new ROT.Scheduler.Simple()
let game = new Game(scheduler)
game.init()

let director = new Director(game, scheduler)
game.director = director

// game.init()


async function mainLoop() {
    while (1) {
        let actor = scheduler.next()
        if (!actor) { break }
        // console.log("scheduled actor", actor)

        if(actor.isPlayer()){
            game.updateGui()
            game.redraw()
        }

        // director.debugScheduler()
        // TODO add to debug output
        // console.log("actor turn", actor)
        let action = await actor.act()
        while(action){
            // console.log("got action", action)
            action = action.execute(game)
        }

        if (actor.isPlayer()) {
            director.tick()
            game.clearMessage()
            game.turns++
        }

        if(game.gameOver){
            return
        }

        // console.log("game dirty", game.dirty, game)
        if(game.dirty){
            // console.log("redraw")
            game.redraw()
            game.dirty = false
        }
    }
}

mainLoop()

