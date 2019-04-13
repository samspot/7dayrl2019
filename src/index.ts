import * as ROT from 'rot-js';
import SelfPortrait from '../assets/img/self-portrait.png';
import Config from './config';
import { Director } from './director';
import { Game } from './game';
import { renderScores } from './score';

declare global {
    interface Window {
        directorsCut: any;
        mainLoop: any;
    }
}

var dc = <HTMLInputElement>document.getElementById('dcut')
dc.onclick = () => {
    if (dc.checked) {
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
    game.director = director;

    (<HTMLElement>document.getElementsByClassName('title')[0]).style.display = 'none';
    (<HTMLElement>document.getElementsByClassName('game')[0]).style.display = 'block';

    let i = 0
    setInterval(() => {
        game.swapTiles(i++)
    }, 400)
    while (1) {
        let actor = scheduler.next()
        if (!actor) { break }
        // console.log("scheduled actor", actor)

        if (actor.isPlayer()) {
            game.updateGui()
            game.redraw()
        }


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
            renderScores();
            (<HTMLElement>document.getElementsByClassName('title')[0]).style.display = "block";
            (<HTMLElement>document.getElementsByClassName('game')[0]).style.display = "none";

            document.querySelectorAll('.firstRun').forEach((e: HTMLElement) => e.style.display = "block")

            return
        }

        if (game.dirty) {
            game.redraw()
            game.dirty = false
        }
    }
}

if (Config.debug && Config.skipTitle) {
    mainLoop()
}

window.mainLoop = mainLoop

renderScores()

let sam = new Image()
sam.src = SelfPortrait
document.getElementById('pixelSam').appendChild(sam)
