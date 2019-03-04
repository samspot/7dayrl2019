import * as ROT from 'rot-js'
import { keyMap } from './keymap.js'

export class Action {
    constructor(actor) {
        this.actor = actor
    }

    executeParent(game) {
        // console.log('executing', this)
    }
}

export class AttackAction extends Action {
    constructor(actor, target) {
        super(actor)
        this.target = target
    }

    execute(game){
        alert('attack ' + this.actor.out() + ' against ' + this.target.out())
    }
}

export class MoveAction extends Action {
    constructor(actor, direction, newX, newY) {
        super(actor)
        this.direction = direction
        this.newX = newX
        this.newY = newY
    }

    execute(game){
        this.executeParent(game)
        let actor = this.actor

        let newX, newY
        if(this.newX && this.newY){
            newX = this.newX
            newY = this.newY
        }

        if(actor.isPlayer()){
            var diff = ROT.DIRS[8][keyMap[this.direction]];
            newX = actor._x + diff[0];
            newY = actor._y + diff[1];

            // is the space in the map at all?
            var newKey = newX + "," + newY;
            if (!(newKey in game.map)) { return }
        }

        // collision here
        let character = game.getCharacterAt(actor, newX, newY)
        if(character){
            return new AttackAction(actor, character)
        }

        game.display.draw(actor._x, actor._y, game.map[actor._x + "," + actor._y])
        actor._x = newX;
        actor._y = newY;
        actor.draw();
    }
}

// TODO PickupAction is busted
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

    execute(game){
        return
    }
}
