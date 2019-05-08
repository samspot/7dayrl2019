import * as _ from 'lodash';
import * as ROT from 'rot-js';
import { Ability } from './abilities';
import { Actor } from './actor';
import Config from './config';
import { Game } from './game';
import { keyMap } from './keymap';
import { Monster } from './monster';
import { Player } from './player';
import { addScore } from './score';
import { FakeActor } from './fakeactor';
import { Action } from './action';
import { InfectAction } from './infectaction';
import { DamageAction } from './damageaction';



export class AttackAction extends Action {
    target: Actor
    constructor(actor: Actor, target: Actor) {
        super(actor)
        this.target = target
    }

    execute(game: Game) {
        return new DamageAction(this.target, this.actor.str, `melee attack`, this.actor)
    }
}

export class MoveAction extends Action {
    direction: string
    newX: number
    newY: number
    constructor(actor: Actor, direction: string, newX: number, newY: number) {
        super(actor)
        this.direction = direction
        this.newX = newX
        this.newY = newY
    }

    execute(game: Game) {
        this.executeParent(game)
        let actor = this.actor

        let newX, newY
        if (this.newX >= 0 && this.newY >= 0) {
            newX = this.newX
            newY = this.newY
        }

        if (actor.isPlayer()) {
            // @ts-ignore
            var diff = ROT.DIRS[8][keyMap[this.direction]];
            newX = actor.x + diff[0];
            newY = actor.y + diff[1];

            // is the space in the map at all?
            var newKey = newX + "," + newY;
            if (!(newKey in game.map)) { return }
        }

        let character = game.getCharacterAt(actor, newX, newY)
        // console.log(`spawn-${actor.spawnId} ${actor.x},${actor.y} moving to ${this.newX},${this.newY} blocked by ${character}`)

        if (actor.isPlayer() && character && character.name === 'stairs') {
            return new DescendAction(character)
        }

        if (character) {
            return new AttackAction(actor, character)
        }

        // game.display.draw(actor.x, actor.y, game.map[actor.x + "," + actor.y])
        actor.x = newX;
        actor.y = newY;
        // actor.draw();
    }
}

export class PickupAction extends Action {
    constructor(actor: Actor) {
        super(actor)
    }

    execute(game: Game) {
        // console.log("execute pickup action")
        this.executeParent(game)
    }
}

export class DescendAction extends Action {
    constructor(actor: Actor) {
        // console.log('creating descend action')
        super(actor)
    }

    execute(game: Game) {
        if (game.levelBossPassed() || Config.debug) {
            // console.log('descending?')
            game.currentLevel++

            /*
            if (game.currentLevel >= 5) {
                game.currentLevel--
                return new YouWinAction(this.actor)
            }
            */

            // if (game.didWin()) {
            // game.win()
            // }

            game.director.resetLevel()
            game.generateMap(game.director.getLevelSpec())

            this.actor.descending = false

        } else {
            // console.log('level boss not passed')
        }
    }
}

export class AbilityAction extends Action {
    ability: Ability
    constructor(actor: Actor, ability: Ability, x: number, y: number) {
        super(actor)
        this.ability = ability
        this.x = x
        this.y = y
    }

    execute(game: Game) {
        this.ability.cooldown = this.ability.maxCooldown
        let actor = game.getCharacterAt(null, this.x, this.y)

        // if (actor.isPlayer() || this.ability.mobsGetSideEffects()) {
        if (this.ability.mobsGetSideEffects()) {
            this.ability.sideEffects(this, game, actor)
        } else {
            // console.log('skipping side effects for ability', this.ability, 'actor', actor)
        }

        // console.log("executing ability action",
        //     this.ability, this.x, this.y, actor)

        // TODO: WTH is going on?  AbilityAction creator passing junk data?
        if (this.actor instanceof Game) {
            this.actor = game.player
        }

        // console.log("AbilityAction this.actor", this.actor)
        if (actor) {
            let source = this.ability.constructor.name

            return new DamageAction(actor, this.ability.dmg, source, this.actor)
        }
    }
}

export class DefaultAction extends Action {
    constructor() {
        super()
    }

    execute(game: Game) {
        return
    }
}

export class YouWinAction extends Action {
    done: boolean
    constructor(actor: Actor) {
        super(actor)
        this.done = false
    }

    execute(game: Game) {
        game.gameOver = true
        game.gameDisplay.updateGui()

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

        this.done = true
    }
}
