
import _ from 'lodash';
import * as ROT from 'rot-js'
import { Player } from './player.js'
import { Monster } from './monster.js'
import { Director } from './director.js';

/*
X. add boss down list to gui
2. on boss kill make stairs down, gen new level
3. add enemy/player special abilities
4. make mapgen create large rooms.  swarm the tyrant 
5. mouse controls to ui
*/
export class Game {
    constructor(scheduler) {
        this.scheduler = scheduler
        this.display = null
        this.map = {}
        this.engine = null
        this.player = null
        this.ananas = null
        this.mobs = []
        this.gameOver = false
        this.score = 0
    }

    init() {
        this.display = new ROT.Display();
        // this.display.style = "float: left"
        // document.body.appendChild(this.display.getContainer());
        document.getElementById("map").appendChild(this.display.getContainer())

        this.generateMap();

        this.director = new Director(this.player, this)

        this.scheduler.add(this.player, true)
        // this.scheduler.add(this.pedro, true)
    }

    getFreeCells() {
        let freeCells = []
        // Object.keys(this.map).forEach(function (key) {
        Object.keys(this.map).forEach(key => {
            if (this.map[key] === '.') {
                freeCells.push(key)
            }
            // var value = hash[key]
            // iteration code
        })
        return freeCells
    }

    getCharacterAt(mover, x, y) {
        let actor
        let testgroup = _.clone(this.mobs)
        // console.log('testgroup1', testgroup)
        testgroup.push(this.player)
        // console.log('testgroup2', testgroup)
        testgroup.forEach(mob => {
            if (mob !== mover) {
                // console.log('checking mover', mover.out(), 'heading',
                // x+','+y, 'vs target', mob.out())
                if (mob.x === x && mob.y === y) {
                    actor = mob
                }
            }
        })

        // console.log("\n")
        return actor
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
        // this.pedro = this.createBeing(Pedro, freeCells)
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

        // console.log("Player", this.player && this.player.hp)
    }

    createBeing(what, freeCells, mobspec) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length)
        var key = freeCells.splice(index, 1)[0]
        var parts = key.split(",")
        var x = parseInt(parts[0])
        var y = parseInt(parts[1])
        return new what(x, y, this, mobspec)
    }

    gameover(msg) {
        alert(msg)
        // this.game.scheduler.remove(this)
        this.game.scheduler.clear()
    }

    updateGui() {
        document.getElementById('name').innerHTML = this.player.name
        document.getElementById('hp').innerHTML = this.player.hp
        document.getElementById('score').innerHTML = this.score

        if (this.player.hp < 30) {
            document.getElementById('hp').style = "color: red"
        }

        let moblist = document.getElementById('monsters')
        if (moblist) {
            moblist.innerHTML = ''
            this.mobs.forEach(x => {
                let elem = document.createElement('li')
                elem.innerHTML = x.name

                let list = document.createElement('ul')
                elem.appendChild(list)

                let hp = document.createElement('li')
                hp.innerHTML = x.hp
                list.appendChild(hp)


                moblist.appendChild(elem)
            })
        }


    }

    addScore(x){
        this.score += x
    }

    resetScore(){
        this.score = 0
    }
}
