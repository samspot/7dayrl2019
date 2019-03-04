import { Actor } from './actor.js'
import * as ROT from 'rot-js'
import { Action, MoveAction, AttackAction, PickupAction } from './actions.js'
import { keyMap } from './keymap.js'

export class Player extends Actor {
    constructor(x, y, game) {
        super(x, y, "@", "#ff0", game)

        this.name = "Tyrant"
        // this.hp = 200
        this.hp = 1
        this.str = 25
    }

    isPlayer() {
        return true
    }

    act() {
        // console.log('Player act')
        window.addEventListener("keydown", this);
        return new Promise((resolve, reject) => {

            this.resolve = resolve
            this.reject = reject
        })
    }

    // TODO: Tank controls?
    handleEvent(e) {
        var code = e.keyCode;
        // enter or space
        if (code == 13 || code == 32) {
            // console.log("key hit for pickup action")
            let action = new PickupAction(this)
            this.resolve(action)
            return
        }

        if (!(code in keyMap)) { return }

        window.removeEventListener("keydown", this);
        this.resolve(new MoveAction(this, code))
    }

    checkBox() {
        var key = this._x + "," + this._y;
        if (this._game.map[key] != "*") {
            alert("There is no box here!");
            this._game.display.drawText(20, 2, "There is no box here")
        } else if (key == this._game.ananas) {
            // alert("Hooray! You found an ananas and won the game.");
            window.removeEventListener("keydown", this);
            this._game.gameover("Hooray! You found an ananas and won the game.")
        } else {
            alert("This box is empty :-(");
        }
    }

}