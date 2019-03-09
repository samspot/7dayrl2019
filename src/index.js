import _ from 'lodash'
import * as ROT from 'rot-js'
import { Game } from './game.js'
import { Director } from './director.js'
import Config from './config.js'


async function mainLoop() {

    if (Config.seed) {
        ROT.RNG.setSeed(Config.seed)
    }

    let scheduler = new ROT.Scheduler.Simple()
    let game = new Game(scheduler)
    game.init()

    let director = new Director(game, scheduler)
    game.director = director

    console.log('starting main loop')
    document.getElementsByClassName('title')[0].style = "display: none;"
    document.getElementsByClassName('game')[0].style = "display: block;"

    while (1) {
        let actor = scheduler.next()
        if (!actor) { break }
        // console.log("scheduled actor", actor)

        if (actor.isPlayer()) {
            game.updateGui()
            game.redraw()

            if(game.director.boss){
                game.gameDisplay.drawBossSplash(game.director.boss)
            }
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
            updateScores()
            document.getElementsByClassName('title')[0].style = "display: block;"
            document.getElementsByClassName('game')[0].style = "display: true;"
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
function updateScores() {
    let highScores = JSON.parse(localStorage.getItem("highscores"))
    // console.dir(highScores)
    if (!_.isArray(highScores)) { highScores = [] }
    // highScores.push({name: game.player.name, score: game.score})
    // localStorage.setItem("highscores", JSON.stringify(highScores))


    let ol = document.createElement('ol')
        // let highScoreHtml = '<h2>High Scores</h2><ol>'
        ;
    highScores.sort((a, b) => b.score - a.score).forEach(s => {
        let li = document.createElement('li')
        li.innerHTML = `${s.name}: ${s.score}`
        ol.appendChild(li)
        // highScoreHtml += `<li>${s.name}: ${s.score}</li>`
    })
    // highScoreHtml += '</ol>'
    // alert(highScoreHtml)


    let elem = document.getElementById('highScoresSplash')
    elem.innerHTML = ''
    elem.appendChild(ol)
}
updateScores()
