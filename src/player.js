import {Actor} from './actor.js'
import * as ROT from 'rot-js'

export class Player extends Actor {
    constructor(x, y, game) {
        super(x, y, "@", "#ff0", game)
    }

    act() {
        this._game.engine.lock();
        window.addEventListener("keydown", this);
    }

    handleEvent(e) {
        // https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
        var keyMap = {};
        keyMap[38] = 0;
        keyMap[33] = 1;
        keyMap[39] = 2;
        keyMap[34] = 3;
        keyMap[40] = 4;
        keyMap[35] = 5;
        keyMap[37] = 6;
        keyMap[36] = 7;

        keyMap[ROT.KEYS.VK_LEFT] = 6; // 37, left arrow
        keyMap[38] = 0; // up arrow
        keyMap[39] = 2; // right arrow
        keyMap[40] = 4; // down arrow

        var code = e.keyCode;

        // enter or space
        if (code == 13 || code == 32) {
            this.checkBox();
            return;
        }

        if (!(code in keyMap)) { return }

        var diff = ROT.DIRS[8][keyMap[code]];
        var newX = this._x + diff[0];
        var newY = this._y + diff[1];

        var newKey = newX + "," + newY;
        if (!(newKey in this._game.map)) { return }

        this._game.display.draw(this._x, this._y, this._game.map[this._x + "," + this._y])
        this._x = newX;
        this._y = newY;
        this.draw();
        window.removeEventListener("keydown", this);
        this._game.engine.unlock();
    }

    checkBox() {
        var key = this._x + "," + this._y;
        if (this._game.map[key] != "*") {
            alert("There is no box here!");
            this._game.display.drawText(20, 2, "There is no box here")
        } else if (key == this._game.ananas) {
            alert("Hooray! You found an ananas and won the game.");
            this._game.engine.lock();
            window.removeEventListener("keydown", this);
        } else {
            alert("This box is empty :-(");
        }
    }

}