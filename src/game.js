
import _ from 'lodash';
import * as ROT from 'rot-js'
import { Player } from './player.js'
import { Monster } from './monster.js'
import { Director } from './director.js'
import Config from './config.js'

import { GameDisplay } from './display.js'
import Maps from './maps.js'
import Tyrant from 'assets/tyrant.json'

/* feedback

* FIXED enter key close modal
* FIXED boss spawn in same room, no
* pathing when player unreachable

* special abilities like bite can target diagonal, but you cant bump attack that direction, correct?
    - i first noticed when a zombie grabbed me around a corner, I thought I was safe
    - it would be less of a BS moment at first, would increase player power
    - maybe remove some death learning dark souls style?
    - you are supposed to die a lot in these games to learn the mechanics right? lol
    - so if you leave it like it is, it offers a bit more depth
* on the map I saw the letter for a monster, but it did not appear on the monster list until the next turnthe same will happen for updating the target portrait
* FIXED cancel target on Q,E,R 
    - FIXED: show hint about pressing esc
* FIXED target cursor still under the player
* FIXED abbreviate start screen on first load
* FIXED: high score local storage crash 
* FIXED: special characters on bios
* FIXED: ability tooltips should show same info as boss splash, I would recommend listing out the CD, damage and range
* FIXED I do currently feel like the magnum cooldown should be longer
* FIXED 'm having a little diffculty understanding the infect mechanic
* FIXED on side bar show 'infectable' instead of 'injured'
* FIXED level clear message when all mobs dead (going for high score)

samspot:
	ok that's good to know
	should i say 'infectable' on the right side instead of injured... currently those aren't exactly the same thing

Dave:
	That would help

samspot:
	infect does your melee damage and takes over the creature if you kill it.  otherwise you can take a mob if it's injured status and you die

Dave:
	Ah ok.  I assumed infect was a status
	so I was like... uh I may die, let me infect this so when I do die I respawn as it?
	So its kind of like a possession by killing blow

samspot:
	yeah, the last part
	i wonder how best to explain it
	i don't think i can majorly change the way it works in the time i have left
	but i can tweak some things

Dave:
	could have a story explanation or something
	that you are a parasite

samspot:
	oh like you are playing as the T virus?
Dave:
	yeah
	so the 'infect' ability would be the actual parasite module/organ/tissue doing an attack independent of its host
	if it senses its target is weak, it transfers
	if not, its just that big blob of fleshy stuff doing a spikey attack or whatever


    I possesed a chimera and somehow was in the same tile as a zombie
you dont have to respond to any of this, im just saying whats going on as I see it lol
lol I charged through a wall and this happene

I was just wondering, since youu can revive unlimited amount of times
It would be fun to have a choice to revive as the boss you infested in the current run
But then again, it would not make sense

[2:01 PM]
samspot:
	oh you men start the game as jIll next playthrough?



defect: charge still causing issues
1. refine start screen my pic, logo
3. Revisit enemy colors
X. block input on boss splash modal
FB: hard to see who is the boss
TODO: charge can take you out of bounds, but this might be fun?
TODO: enemies in the dark can use abilities - decide on this
TODO: Look into showing explored tiles

X. lower spawn rates like a lot!
FIXED defect; restart game doesn't clear boss progress
FIXED defect: high scores wrong name - cannot reproduce today
FIXED (lower spawn rate) FB: catacombs hard, swarmed
FIXED (remove charge) FB: Also is it normal that when I melee attack as chris or a spider I jump bodies instantly ?
FIXED (remove charge) FB: the hunting mansion is a black screen

Descoped

1. status effects like 'grabbed'
2. add "and DIED!" to damage messages that kill
3. mouse controls to ui
4. tiles

*/

function gpToString(){
    return `${this.name} ${this.boss} bossDown? ${this.bossDown} level:${this.level}`
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
            level0: {toString: gpToString},
            level1: {toString: gpToString},
            level2: {toString: gpToString},
            level3: {toString: gpToString},
            level4: {toString: gpToString}
        }

        // TODO remove this duplicate info (also in director.levelNames)
        this.gameProgress.level0.level = 0
        this.gameProgress.level0.name = "The Laboratory"
        this.gameProgress.level0.boss = "Jill Valentine"
        this.gameProgress.level0.floorColor = '#999999'
        this.gameProgress.level0.wallColor = '#ffffff'
        this.gameProgress.level0.spawnRate = 3
        this.gameProgress.level0.text = "Status Unknown"
        this.gameProgress.level0.style = "font-style: italic"
        this.gameProgress.level0.bossDown = false

        this.gameProgress.level1.level = 1
        this.gameProgress.level1.name = "Catacombs"
        this.gameProgress.level1.boss = "Chris Redfield"
        this.gameProgress.level1.floorColor = '#cc9966'
        this.gameProgress.level1.wallColor = '#660033'
        this.gameProgress.level1.spawnRate = 7
        this.gameProgress.level1.text = "Status Unknown"
        this.gameProgress.level1.style = "font-style: italic"
        this.gameProgress.level1.bossDown = false

        this.gameProgress.level2.level = 2
        this.gameProgress.level2.name = "Garden"
        this.gameProgress.level2.boss = "Barry Burton"
        this.gameProgress.level2.floorColor = '#cc9966'
        this.gameProgress.level2.wallColor = '#006600'
        this.gameProgress.level2.spawnRate = 6
        this.gameProgress.level2.text = "Status Unknown"
        this.gameProgress.level2.style = "font-style: italic"
        this.gameProgress.level2.bossDown = false

        this.gameProgress.level3.level = 3
        this.gameProgress.level3.name = "Guardhouse"
        this.gameProgress.level3.boss = "Brad Vickers"
        this.gameProgress.level3.floorColor = '#cccc99'
        this.gameProgress.level3.wallColor = '#330066'
        this.gameProgress.level3.spawnRate = 4
        this.gameProgress.level3.text = "Status Unknown"
        this.gameProgress.level3.style = "font-style: italic"
        this.gameProgress.level3.bossDown = false

        this.gameProgress.level4.level = 4
        this.gameProgress.level4.name = "The Mansion"
        this.gameProgress.level4.boss = "Albert Wesker"
        this.gameProgress.level4.floorColor = '#6699cc'
        this.gameProgress.level4.wallColor = '#660033'
        this.gameProgress.level4.spawnRate = 5
        this.gameProgress.level4.text = "Status Unknown"
        this.gameProgress.level4.style = "font-style: italic"
        this.gameProgress.level4.bossDown = false
    }

    allBossesDown() {
        let bosses = []
        Object.keys(this.gameProgress).forEach(key => {
            bosses.push(this.gameProgress[key].bossDown)
        })

        return _.every(bosses) || this.gameProgress.level4.bossDown
    }

    levelBossPassed() {
        return this.getGameProgress().bossDown
    }

    init() {
        let options = {
            width: Config.gamePortWidth,
            height: Config.gamePortHeight,
            fontSize: Config.fontSize,
            forceSquareRatio: true,
            fontStyle: "bold"
        }
        this.display = new ROT.Display(options);

        document.getElementById("mapContainer").innerHTML = ''
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

        if(this.player.isTargetMode() && this.cursor){
            this.cursor.drawMe()
        }

        if(Config.drawAllMobs){
            this.mobs.forEach(m => m.drawMe())
        } else {
            this.getVisibleMobs().forEach(m => m.drawMe(fovFloorColor))
        }
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
