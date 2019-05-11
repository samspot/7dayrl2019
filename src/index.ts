import * as ROT from 'rot-js';
import SelfPortrait from '../assets/img/self-portrait.png';
import Config from './config';
import { Director } from './director';
import { Game } from './game';
import { renderScores } from './score';
import { GameDisplay } from './display'

declare global {
    interface Window {
        directorsCut: boolean;
        mainLoop: Function;
        gameDisplay: GameDisplay
    }
}

var dc = <HTMLInputElement>document.getElementById('dcut')
dc.onclick = () => {
    window.directorsCut = dc.checked
    console.log("directorsCut enabled", window.directorsCut)
}


async function mainLoop() {

    if (Config.seed) {
        ROT.RNG.setSeed(Config.seed)
    }

    // let scheduler = new ROT.Scheduler.Simple()
    let scheduler = new ROT.Scheduler.Speed()
    let game = new Game(scheduler)
    game.init()

    let director = new Director(game, scheduler)
    game.director = director;

    (<HTMLElement>document.getElementsByClassName('title')[0]).style.display = 'none';
    (<HTMLElement>document.getElementsByClassName('game')[0]).style.display = 'block';

    let i = 0
    if (Config.animate) {
        let start: any = null
        let fps = 4
        let changeEvery = 1000 / fps
        let elapsed = changeEvery
        let loop = (timestamp: any) => {
            if (!start) start = timestamp
            let dt = timestamp - start
            start = timestamp

            elapsed += dt
            if (elapsed > changeEvery) {
                elapsed = 0
                game.swapTiles(i++)
                game.gameDisplay.processAnimations()
            }

            requestAnimationFrame(loop)
        }

        requestAnimationFrame(loop)
    }

    game.setupDraw()
    while (1) {

        let actor = scheduler.next()
        // console.log('SCHEDULE: next actor', actor)
        if (!actor) {
            console.log('THIS SHOULD NEVER HAPPEN, BREAKING OUT OF GAME LOOP')
            return
        }

        // Update the GUI right before requesting player input
        if (actor.isPlayer()) {
            game.gameDisplay.updateGui()
            game.fixActorOverlap()
        }

        let action = await actor.act()

        if (actor.isPlayer() && game.gameDisplay.hasAnimations()) {
            console.log('skip player turn here')
            scheduler.add(actor, false)
            continue
        }

        while (action) {
            action = action(game)
        }

        if (actor.isPlayer()) {
            director.tick()
            game.turns++

            if (game.didWin()) {
                console.log('checking WIN condition', scheduler.next(), scheduler.next(), scheduler.next())
                game.win()
            }
        }

        if (game.gameOver) {
            renderScores();
            (<HTMLElement>document.getElementsByClassName('title')[0]).style.display = "block";
            (<HTMLElement>document.getElementsByClassName('game')[0]).style.display = "none";

            document.querySelectorAll('.firstRun').forEach((e: HTMLElement) => e.style.display = "block")

            return
        }

        game._drawFov()
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
