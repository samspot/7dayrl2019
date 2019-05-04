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
        let fps = 2
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
            }

            requestAnimationFrame(loop)
        }

        requestAnimationFrame(loop)
    }
    // while (1) {

    let start2: any = null
    let fps2 = 200
    // let fps2 = 1
    let changeEvery2 = 1000 / fps2
    let elapsed2 = changeEvery2

    // let loop2 = (timestamp: any) => {
    async function loop2(timestamp: any) {
        if (!start2) start2 = timestamp
        let dt = timestamp - start2
        start2 = timestamp

        elapsed2 += dt


        if (elapsed2 > changeEvery2) {
            elapsed2 = 0

            let actor = scheduler.next()
            // console.log('SCHEDULE: next actor', actor)
            if (!actor) { return }
            // console.log("scheduled actor", actor)

            if (actor.isPlayer()) {
                game.updateGui()
                game.redraw()
                game.fixActorOverlap()
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
        requestAnimationFrame(loop2)
    }

    requestAnimationFrame(loop2)
}

if (Config.debug && Config.skipTitle) {
    mainLoop()
}

window.mainLoop = mainLoop

renderScores()

let sam = new Image()
sam.src = SelfPortrait
document.getElementById('pixelSam').appendChild(sam)
