import * as ROT from 'rot-js'
import { keyMap } from './keymap.js'

export class Action {
    constructor(actor) {
        this.actor = actor
    }

    executeParent(game) {
        console.log('executing', this)
    }
}

export class AttackAction extends Action {
    constructor(actor, target) {
        super(actor)
    }
}

export class MoveAction extends Action {
    constructor(actor, direction) {
        super(actor)
        this.direction = direction
    }

    execute(game){
        this.executeParent(game)
        let actor = this.actor

        var diff = ROT.DIRS[8][keyMap[this.direction]];
        var newX = actor._x + diff[0];
        var newY = actor._y + diff[1];

        // is the space in the map at all?
        var newKey = newX + "," + newY;
        if (!(newKey in game.map)) { return }

        // collision here

        game.display.draw(actor._x, actor._y, game.map[actor._x + "," + actor._y])
        actor._x = newX;
        actor._y = newY;
        actor.draw();
        window.removeEventListener("keydown", actor);
        // this.actor.resolve()
    }
}

export class PickupAction extends Action {
    constructor(actor) {
        super(actor)
    }

    execute(game) {
        this.executeParent(game)
        this.actor.checkBox()
    }
}

export class DefaultAction extends Action {
    constructor(actor) {
        super(actor)
    }
}
