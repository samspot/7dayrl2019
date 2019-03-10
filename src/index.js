import _ from 'lodash'
import * as ROT from 'rot-js'
import { Game } from './game.js'
import { Director } from './director.js'
import Config from './config.js'
import SelfPortrait from '../assets/img/self-portrait.png'
import { GameDisplay } from './display.js'
import { renderScores } from './score.js'


let dc = document.getElementById('dcut')
dc.onclick = () => {
    if(dc.checked){
        window.directorsCut = true
    } else {
        window.directorsCut = false
    }
    console.log("directorsCut enabled", window.directorsCut)
}

async function mainLoop() {

    if (Config.seed) {
        ROT.RNG.setSeed(Config.seed)
    }

    let scheduler = new ROT.Scheduler.Simple()
    let game = new Game(scheduler)
    game.init()

    let director = new Director(game, scheduler)
    game.director = director

    // console.log('starting main loop')
    document.getElementsByClassName('title')[0].style = "display: none;"
    document.getElementsByClassName('game')[0].style = "display: block;"

    while (1) {
        let actor = scheduler.next()
        if (!actor) { break }
        // console.log("scheduled actor", actor)

        if (actor.isPlayer()) {
            game.updateGui()
            game.redraw()
            // console.log('directors-cut', window.directorsCut)

            // if(game.director.boss){
            // game.gameDisplay.drawBossSplash(game.director.boss)
            // }
        }

        // director.debugScheduler()
        // TODO add to debug output
        // console.log("actor turn", actor)
        let action = await actor.act()
        while (action) {
            // console.log("got action", action)
            action = action.execute(game)
        }

        if (actor.isPlayer()) {
            director.tick()
            game.turns++
        }

        if (game.gameOver) {
            renderScores()
            document.getElementsByClassName('title')[0].style = "display: block;"
            document.getElementsByClassName('game')[0].style = "display: none;"

            document.querySelectorAll('.firstRun').forEach(e => e.style = "display: block;")
            // document.getElementsByClassName('firstRun').forEach(e => e.style = "display: block;")
            // TODO DIDN"T WORK Try and clean gamestate
            // TODO manually reset game progress here
            // delete game.director
            // delete game.gameDisplay
            // delete director.game
            return
        }

        // console.log("game dirty", game.dirty, game)
        if (game.dirty) {
            // console.log("redraw")
            game.redraw()
            game.dirty = false
        }
    }
}

if (Config.debug && Config.skipTitle) {
    mainLoop()
}

window.mainLoop = mainLoop
// mainLoop()

// let display = new Display()
// display.renderScores()

renderScores()


let sam = new Image()
sam.src = SelfPortrait
document.getElementById('pixelSam').appendChild(sam)