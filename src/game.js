
import _ from 'lodash';
import * as ROT from 'rot-js'
import { Player } from './player.js'
import { Monster } from './monster.js'
import { Director } from './director.js'
import Config from './config.js'

import { GameDisplay } from './display.js'

/* Defects */
/*
    winning with an ability probably crashes the game
*/

//TODO: I hope this is not chris' blood

/*
TODO: If they posses the level boss, what then?  maybe only allow posess at low hp/dead, then allow descend
X. swap portraits on death, level change
3. add enemy/player special abilities
4. make mapgen create large rooms.  swarm the tyrant 
4. FOV, ai that reacts only to players it can see. different vision per character
5. Make trash mobs better when controlled by the player
5. AI use abilities
5. mouse controls to ui
6. high scores in local storage
7. Start Screen w/ high scores
8. add funny resident evil lines "don't open that dooooor"

BUG: abilities triggering after mobs take turns
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
        this.gameDisplay = new GameDisplay(this)
        this.gameProgress = {
            level0: _.clone(startingLvlStatus),
            level1: _.clone(startingLvlStatus),
            level2: _.clone(startingLvlStatus),
            level3: _.clone(startingLvlStatus),
            level4: _.clone(startingLvlStatus)
        }

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

        this.generateMap()

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

    generateMap() {
        var digger = new ROT.Map.Digger(Config.gamePortWidth, Config.gamePortHeight)
        var freeCells = [];

        var digCallback = function (x, y, value) {
            if (value) { return; }

            var key = x + "," + y;
            this.map[key] = ".";
            freeCells.push(key);
        }

        digger.create(digCallback.bind(this));

        // this.generateBoxes(freeCells);

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
        this.message("You killed the level boss.  Press > to go to the next level.")
        this.getGameProgress().bossDown = true
    }

    possesBoss() {
        this.getGameProgress().style = "color: purple"
        this.getGameProgress().text += " [Possessed]"
        this.message("You possesed the level boss.  Press > to go to the next level.")
        this.getGameProgress().bossDown = true
    }

    message(msg) {
        let elem = document.getElementById('msg')
        elem.classList.remove('fade-in')
        elem.classList.add('fade-in')
        elem.innerHTML = msg
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

    redraw(){
        // TODO only do this if the display is dirty, 1 per player turn
        this.display.clear()
        this.drawWholeMap()
        this.player.drawMe()
        this.mobs.forEach(m => m.drawMe())
    }

    destroyMob(actor){
        // console.log('destroying', actor)
        _.remove(this.mobs, actor)
        this.scheduler.remove(actor)
        this.addScore(actor.score)
        actor.draw('.', 'red')
    }
}
