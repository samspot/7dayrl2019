
import _ from 'lodash';
import * as ROT from 'rot-js'
import {Player} from './player.js'
import {Pedro} from './pedro.js'

export class Game {
    constructor(scheduler){
        this.scheduler = scheduler
        this.display = null
        this.map = {}
        this.engine = null
        this.player = null
        this.ananas = null
    }

    init() {
        this.display = new ROT.Display();
        document.body.appendChild(this.display.getContainer());

        this.generateMap();

        this.scheduler.add(this.player, true)
        this.scheduler.add(this.pedro, true)

    }

    generateMap() {
        var digger = new ROT.Map.Digger();
        var freeCells = [];

        var digCallback = function (x, y, value) {
            if (value) { return; }

            var key = x + "," + y;
            this.map[key] = ".";
            freeCells.push(key);
        }

        digger.create(digCallback.bind(this));

        this.generateBoxes(freeCells);

        this.drawWholeMap();

        // this._createPlayer(freeCells);
        this.player = this.createBeing(Player, freeCells)
        this.pedro = this.createBeing(Pedro, freeCells)
    }

    createPlayer(freeCells) {
        var index = Math.floor(ROT.RNG.getUniform * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0])
        var y = parseInt(parts[1])
        this.player = new Player(x, y, this);
    }

    generateBoxes(freeCells) {
        for (var i = 0; i < 10; i++) {
            var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
            var key = freeCells.splice(index, 1)[0];
            this.map[key] = "*";
            if (!i) { this.ananas = key; }
        }
    }

    drawWholeMap() {
        for (var key in this.map) {
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            this.display.draw(x, y, this.map[key]);
        }
    }

    createBeing(what, freeCells) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length)
        var key = freeCells.splice(index, 1)[0]
        var parts = key.split(",")
        var x = parseInt(parts[0])
        var y = parseInt(parts[1])
        return new what(x, y, this)
    }
}
