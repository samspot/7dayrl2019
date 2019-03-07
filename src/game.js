
import _ from 'lodash';
import * as ROT from 'rot-js'
import { Player } from './player.js'
import { Monster } from './monster.js'
import { Director } from './director.js'
import Config from './config.js'

import { GameDisplay } from './display.js'
import Maps from './maps.js'
import Tyrant from 'assets/tyrant.json'

/* Defects */
/*
* FIXED grenade splash does NaN damage
* FIXED players can charge through/into walls
* FIXED jill's launcher splash damage changes her hp to NaN, making her invincible
* FIXED enemies can charge you into walls, removing vision
* FIXED Only show combat messages for things you can see (including target seen but not attacker) seed: 12358, turnsToSim: 28

TODO: charge can take you out of bounds, but this might be fun?
TODO: enemies in the dark can use abilities - decide on this
TODO: Look into showing explored tiles
TODO: adjust spawn rates, mix for each map

X. if you die with no available targets, the tyrant ressurects.  
X. show ? mark for boss until seen
X: infect with impale ability, kill or wound

5. resident evil 1 inventory font
6. style gui like the RE1 inventory screen
7. implement bootstrap or some other framework that gives me easy modal windows.  Need one for infect
7. Show boss splash when first seen, including abilities
8. mouse controls to ui
9. high scores in local storage
10. Start Screen w/ high scores
11. add funny resident evil lines "don't open that dooooor" I hope this is not chris' blood
12. status effects like 'grabbed'
13. more monster abilities
14. tiles

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
        this.gameProgress.level0.floorColor = '#999999'
        this.gameProgress.level0.wallColor = '#ffffff'

        this.gameProgress.level1.name = "Catacombs"
        this.gameProgress.level1.boss = "Chris Redfield"
        this.gameProgress.level1.floorColor = '#cc9966'
        this.gameProgress.level1.wallColor = '#660033'

        this.gameProgress.level2.name = "Garden"
        this.gameProgress.level2.boss = "Barry Burton"
        this.gameProgress.level2.floorColor = '#cc9966'
        this.gameProgress.level2.wallColor = '#006600'

        this.gameProgress.level3.name = "Guardhouse"
        this.gameProgress.level3.boss = "Brad Vickers"
        this.gameProgress.level3.floorColor = '#cccc99'
        this.gameProgress.level3.wallColor = '#330066'

        this.gameProgress.level4.name = "The Mansion"
        this.gameProgress.level4.boss = "Albert Wesker"
        this.gameProgress.level4.floorColor = '#6699cc'
        this.gameProgress.level4.wallColor = '#660033'
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
        // console.log("game resetLevel()")
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

        if (Config.debug && Config.drawWholeMap) {
            this.drawWholeMap();
        }

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
        this.message(`You killed the level boss.  Press > to go to The ${this.director.getNextLevelDescription()}.`, true, this.player, this.boss)
        this.getGameProgress().bossDown = true
    }

    possesBoss() {
        this.getGameProgress().style = "color: purple"
        this.getGameProgress().text += " [Infected]"
        // TODO: replace 'next level' with the name of the level
        this.message(`You infected the level boss.  Press > to go to The ${this.director.getNextLevelDescription()}.`, true, this.player, this.boss)
        this.getGameProgress().bossDown = true
    }

    message(msg, important){
        let message = {
            msg: msg,
            turn: this.turns,
            important: important
        }
        this.messages.unshift(message)
        this.gameDisplay.drawMessages()
    }

    dmgMessage(msg, important, source, target, actorSource) {
        // console.log('msg', msg)
        let message = { 
            msg: msg, 
            turn: this.turns, 
            important: important,
            source: source,
            target: target,
            actorSource: actorSource
        }
        // console.log('printing msg', message.msg)
        this.messages.unshift(message)
        this.gameDisplay.drawMessages()
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
        if (Config.debug && Config.drawWholeMap) {
            this.drawWholeMap()
        }
        this.drawFov()
        // this.player.drawMe()
        // this.mobs.forEach(m => m.drawMe())

    }

    drawFov() {
        // TODO liked trent reznor 'on we march' for background music

        // TODO vary these colors by level
        // let fovFloorColor = "#333"
        // let fovWallColor = "#660"

        let fovFloorColor = this.getGameProgress().floorColor
        let fovWallColor = this.getGameProgress().wallColor

        let map = this.map

        function lightPasses(x, y) {
            let key = x + ',' + y
            if (key in map) { return (map[key] === '.') }
            return false
        }

        let fov = new ROT.FOV.PreciseShadowcasting(lightPasses)

        this.visibleSquares = []
        fov.compute(this.player.x, this.player.y, this.player.sightRadius, (x, y, r, visibility) => {
            let ch = r ? "" : "@"
            // let color = map[x+","+y] ? "#aa0": "#660"
            let color = map[x + "," + y] ? fovFloorColor : fovWallColor
            this.visibleSquares.push(x + ',' + y)
            this.display.draw(x, y, ch, this.player.color, color)
        })

        if(this.player.isTargetMode()){
            this.cursor.drawMe()
        }

        this.getVisibleMobs().forEach(m => m.drawMe(fovFloorColor))
    }

    getVisibleSquares() {
        return this.visibleSquares
    }

    getVisibleMobs() {
        let visibleMobs = _.filter(this.mobs, m => _.findIndex(this.getVisibleSquares(), i => i === m.x + ',' + m.y) >= 0)
        // if(onlyInfectable){
            // visibleMobs = _.filter(visibleMobs, m => m.isInfectable())
            // console.log("infectable mobs", visibleMobs)
        // }
        visibleMobs.forEach(m => m.setSeen())
        return visibleMobs
    }

    getInfectableMobs(){
        let mobs = _.filter(this.getVisibleMobs(), m => m.isInfectable())
        // console.log("infectable mobs", mobs)
        let reviveMob = new Monster(0, 0, this, Tyrant)
        reviveMob.isRevive = true
        reviveMob.name = "Revive Tyrant"
        mobs.push(reviveMob)
        return mobs
    }

    destroyMob(actor) {
        // console.log('destroying', actor)
        _.remove(this.mobs, actor)
        this.scheduler.remove(actor)
        this.addScore(actor.score)
        actor.draw('.', 'red')
    }

    reschedule(){
         this.scheduler.clear()
         this.scheduler.add(this.player, true)
         this.mobs.forEach(m => {
             this.scheduler.add(m, true)
         })

        //  console.log('reschedule', this.scheduler)
    }
}
