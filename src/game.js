
import _ from 'lodash';
import * as ROT from 'rot-js'
import { Player } from './player.js'
import { Monster } from './monster.js'
import { Director } from './director.js'
import Config from './config.js'

import { GameDisplay } from './display.js'
import Maps from './maps.js'

/* Defects */
/*

* abilities generated by the player don't put correct text in the log
* chimera's have grenade launchers - why?  Thought i saw a zombie doing it too
* no longer getting a proper update after infecting an enemy
* monsters don't move when they charge
* abilities triggering after mobs take turns

*/


/*
TODO: If they posses the final level boss, what then?  maybe only allow posess at low hp/dead, then allow descend
X. make mapgen create large rooms.  swarm the tyrant 
2. FOV, ai that reacts only to players it can see. different vision per character
2. Spawn enemies only outside explored/lit areas
2. implement sight range for various characters
3. Make trash mobs better when controlled by the player
4. Swich to ability icons.  grayscale on cooldown with cooldown remaining overlayed
5. resident evil 1 inventory font
6. style gui like the RE1 inventory screen
7. implement bootstrap or some other framework that gives me easy modal windows
8. mouse controls to ui
9. high scores in local storage
10. Start Screen w/ high scores
11. add funny resident evil lines "don't open that dooooor" I hope this is not chris' blood
12. status effects like 'grabbed'

Don't let possess wesker, and require most enemies to be weak <30% hp to possess
*/

const startingLvlStatus = {
    text: "Status Unknown",
    style: "font-style: italic",
    bossDown: false
}

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
        this.turns = 0
        this.gameDisplay = new GameDisplay(this)
        this.messages = []
        this.gameProgress = {
            level0: _.clone(startingLvlStatus),
            level1: _.clone(startingLvlStatus),
            level2: _.clone(startingLvlStatus),
            level3: _.clone(startingLvlStatus),
            level4: _.clone(startingLvlStatus)
        }

        // TODO remove this duplicate info (also in director.levelNames)
        this.gameProgress.level0.name = "The Laboratory"
        this.gameProgress.level0.boss = "Jill Valentine"

        this.gameProgress.level1.name = "Catacombs"
        this.gameProgress.level1.boss = "Chris Redfield"

        this.gameProgress.level2.name = "Garden"
        this.gameProgress.level2.boss = "Barry Burton"

        this.gameProgress.level3.name = "Guardhouse"
        this.gameProgress.level3.boss = "Brad Vickers"

        this.gameProgress.level4.name = "The Mansion"
        this.gameProgress.level4.boss = "Albert Wesker"
    }

    allBossesDown() {
        let bosses = []
        Object.keys(this.gameProgress).forEach(key => {
            bosses.push(this.gameProgress[key].bossDown)
        })

        return _.every(bosses)
    }

    levelBossPassed() {
        return this.getGameProgress().bossDown
    }

    init() {
        let options = {
            width: Config.gamePortWidth,
            height: Config.gamePortHeight,
            fontSize: Config.fontSize,
            forceSquareRatio: true
        }
        this.display = new ROT.Display(options);

        document.getElementById("mapContainer").appendChild(this.display.getContainer())

        this.generateMap(Maps.lab)
    }

    resetLevel() {
        console.log("game resetLevel()")
        this.map = {}
        this.display.clear()
        this.mobs = []
    }

    getFreeCells() {
        // console.log("getFreeCells() this.map", this.map)
        let freeCells = []
        Object.keys(this.map).forEach(key => {
            if (this.map[key] === '.') {
                freeCells.push(key)
            }
        })
        return freeCells
    }

    getCharacterAt(mover, x, y) {
        let actor
        let testgroup = _.clone(this.mobs)
        testgroup.push(this.player)
        testgroup.forEach(mob => {
            if (mob !== mover) {
                // console.log('checking mover', mover.out(), 'heading',
                // x+','+y, 'vs target', mob.out())
                if (mob.x === x && mob.y === y) {
                    actor = mob
                }
            }
        })

        return actor
    }

    generateMap(mapspec) {
        let generator = new mapspec._obj(Config.gamePortWidth, Config.gamePortHeight, mapspec)

        var freeCells = [];

        var digCallback = function (x, y, value) {
            if (value) { return; }
            var key = x + "," + y;
            this.map[key] = ".";
            freeCells.push(key);
        }

        if (mapspec._iterations) {
            generator.randomize(mapspec._randomize)
            for (let i = 0; i < mapspec._iterations - 1; i++) {
                generator.create();
            }
            generator.create(digCallback.bind(this));

            generator.connect(digCallback.bind(this))
        } else {
            generator.create(digCallback.bind(this));
        }

        this.drawWholeMap();

        if (!this.player) {
            this.player = this.createBeing(Player, freeCells)
        } else {
            let { x, y } = this.getRandomMapLocation()
            this.player.x = x
            this.player.y = y
            this.player.draw()
        }
    }

    getRandomMapLocation() {
        let freeCells = this.getFreeCells()
        let index = Math.floor(ROT.RNG.getUniform * freeCells.length)
        let key = freeCells.splice(index, 1)[0]
        let parts = key.split(",")
        return {
            x: parseInt(parts[0]),
            y: parseInt(parts[1])
        }
    }

    createPlayer(freeCells) {
        /*
        var index = Math.floor(ROT.RNG.getUniform * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0])
        var y = parseInt(parts[1])
        */
        let { x, y } = getRandomMapLocation()
        this.player = new Player(x, y, this)
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

    getGameProgress() {
        let key = "level" + this.currentLevel
        return this.gameProgress[key]
    }

    killBoss() {
        this.getGameProgress().style = "text-decoration: line-through; color: red"
        this.message(`You killed the level boss.  Press > to go to The ${this.director.getNextLevelDescription()}.`)
        this.getGameProgress().bossDown = true
    }

    possesBoss() {
        this.getGameProgress().style = "color: purple"
        this.getGameProgress().text += " [Infected]"
        // TODO: replace 'next level' with the name of the level
        this.message(`You infected the level boss.  Press > to go to The ${this.director.getNextLevelDescription()}.`)
        this.getGameProgress().bossDown = true
    }

    message(msg) {
        console.log('printing msg', msg)
        this.messages.unshift({ msg: msg, turn: this.turns })
        this.gameDisplay.drawMessages()
    }

    clearMessage() {
        //document.getElementById('msg').innerHTML = ''
    }

    updateGui() {
        this.gameDisplay.updateGui()
    }

    addScore(x) {
        this.score += x
    }

    resetScore() {
        this.score = 0
    }

    redraw() {
        this.display.clear()
        this.drawWholeMap()
        this.player.drawMe()
        this.mobs.forEach(m => m.drawMe())

    }

    drawFov(){
        let map = this.map

        function lightPasses(x, y){
            let key = x+','+y
            if(key in map){ return (map[key] === '.')}
            return false
        }

        let fov = new ROT.FOV.PreciseShadowcasting(lightPasses)

        let visibleSquares = []
        fov.compute(this.player.x, this.player.y, 6, (x, y, r, visibility) => {
            let ch = r ? "" : "@"
            let color = map[x+","+y] ? "#aa0": "#660"
            visibleSquares.push(x+','+y)
            this.display.draw(x, y, ch, "#fff", color)
        })
        
        this.mobs.forEach(m => {
            let idx = _.findIndex(visibleSquares, i => i === m.x+','+m.y)
            console.log('idx', idx)
            if(idx >= 0){
                console.log("found mob", m, 'in visible area')
                m.drawMe('#aa0')
            }
        })

    }

    destroyMob(actor) {
        // console.log('destroying', actor)
        _.remove(this.mobs, actor)
        this.scheduler.remove(actor)
        this.addScore(actor.score)
        actor.draw('.', 'red')
    }
}
