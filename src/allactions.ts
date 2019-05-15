import * as _ from 'lodash';
import { DIRS } from 'rot-js';
import { Ability } from './abilities';
import { Actor } from './actor';
import Config from './config';
import { Game } from './game';
import { keyMap } from './keymap';
import { addScore } from './score';
import { damageAction } from './damageaction';



export function attackAction(actor: Actor, target: Actor) {
    return function (game: Game) {
        return damageAction(target, actor.str, `melee attack`, actor)
    }
}

export function moveAction(actor: Actor, direction: string, moveToX?: number, moveToY?: number) {
    return function (game: Game) {
        let newX, newY
        if (moveToX >= 0 && moveToY >= 0) {
            newX = moveToX
            newY = moveToY
        }

        if (actor.isPlayer()) {
            var diff = DIRS[8][keyMap[direction]];
            newX = actor.x + diff[0];
            newY = actor.y + diff[1];

            // is the space in the map at all?
            var newKey = newX + "," + newY;
            if (!(newKey in game.map)) { return }
        }

        let character = game.getCharacterAt(actor, newX, newY)
        // console.log(`spawn-${actor.spawnId} ${actor.x},${actor.y} moving to ${this.newX},${this.newY} blocked by ${character}`)

        if (actor.isPlayer() && character && character.name === 'stairs') {
            return descendAction(character)
        }

        if (character) {
            return attackAction(actor, character)
        }

        actor.x = newX;
        actor.y = newY;
    }
}

export function descendAction(actor: Actor) {
    return function (game: Game) {
        if (game.levelBossPassed() || Config.debug) {
            game.currentLevel++

            game.director.resetLevel()
            game.generateMap(game.director.getLevelSpec())

            game.setupDraw()
            actor.descending = false
        }
    }
}

export function abilityAction(sourceActor: Actor, ability: Ability, x: number, y: number) {
    return function (game: Game) {
        ability.cooldown = ability.maxCooldown
        let actor = game.getCharacterAt(null, x, y)

        // if (actor.isPlayer() || this.ability.mobsGetSideEffects()) {
        if (sourceActor.isPlayer() || ability.mobsGetSideEffects()) {
            ability.sideEffects(game, actor, x, y)
        } else {
            // console.log('skipping side effects for ability', this.ability, 'actor', actor)
        }

        // console.log("executing ability action",
        //     this.ability, this.x, this.y, actor)

        // TODO: WTH is going on?  AbilityAction creator passing junk data?
        if (actor instanceof Game) {
            actor = game.player
        }

        // console.log("AbilityAction this.actor", this.actor)
        if (actor) {
            let source = ability.constructor.name

            return damageAction(actor, ability.dmg, source, sourceActor)
        }
    }
}

export function defaultAction() {
    return function (game: Game) { }
}

export function youWinAction() {
    return function (game: Game) {
        game.gameOver = true

        let highScores = addScore(game.player.name, game.score)

        let highScoreHtml = '<h2>High Scores</h2><ol>';
        highScores.sort((a, b) => b.score - a.score).forEach(s => {
            highScoreHtml += `<li>${s.name}: ${s.score}</li>`
        })
        highScoreHtml += '</ol>'


        let modalText = "<h1>You defeated the S.T.A.R.S!  Final Score "
            + game.score + "</h1>"
            + `<p>Try keeping the tyrant alive to improve your score!  Using your infect ability to possess enemies doesn't cost you points.</p>`
            + `<p>${highScoreHtml}</p>`

        game.gameDisplay.showModal(modalText)
    }
}
