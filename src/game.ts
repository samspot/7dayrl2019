import Tyrant from 'assets/tyrant.json';
import * as _ from 'lodash';
import * as ROT from 'rot-js';
import { Actor } from './actor';
import Config from './config';
import { Cursor } from './cursor';
import { Director } from './director';
import { GameDisplay } from './display';
import { IMessage } from './IMessage';
import { GameProgress } from './Level';
import { IMapSpec, Maps } from './maps';
import { MobSpec } from './MobSpec';
import { Monster } from './monster';
import { Player } from './player';
import ReTiles16Catacombs from '../assets/img/re-tiles-16-catacombs.png';

// Bugs
// FIXED grenade launcher text overwrites next ability (change to launcher or grenade)
// FIXED bosses still spawn in player start room
// FIXED ability tooltips missing damage value
// FIXED starting new game didn't clear score, target (wesker dead image), mob list

// MEDIUM use diff symbol for unknown tile (currently crosshair)

// LOW bosses don't show up in mob list immediately
// LOW player sprite doesn't change when infecting
// LOW unseen bosses still taking damage (wesker)

// FIXED? cooldown graphic(s) missing
// FIXED clearing boss splash w/o react: react-dom.development.js:500 Warning: render(...): It looks like the React-rendered content of this container was removed without using React. This is not supported and will cause errors. Instead, call ReactDOM.unmountComponentAtNode to empty a container. // ReactDOM.unmountComponentAtNode 
// DESCOPE similar to above, didn't get a splash on death (may be unrelated)

// TODO Map stuff to maps or levels js
// TODO create player/mob stuff to director js

/* feedback

* special abilities like bite can target diagonal, but you cant bump attack that direction, correct?
    - i first noticed when a zombie grabbed me around a corner, I thought I was safe
    - it would be less of a BS moment at first, would increase player power
    - maybe remove some death learning dark souls style?
    - you are supposed to die a lot in these games to learn the mechanics right? lol
    - so if you leave it like it is, it offers a bit more depth
* on the map I saw the letter for a monster, but it did not appear on the monster list until the next turnthe same will happen for updating the target portrait

FB: hard to see who is the boss
TODO: charge can take you out of bounds, but this might be fun?
TODO: enemies in the dark can use abilities - decide on this
TODO: Look into showing explored tiles

Descoped

1. status effects like 'grabbed'
2. add "and DIED!" to damage messages that kill
3. mouse controls to ui
*/

export class Game {
    maps: Maps
    currentLevel: number
    cursor: Cursor
    scheduler: ROT.Scheduler
    display: ROT.Display
    map: {
        [key: string]: string
    }
    decorations: {
        [key: string]: Array<string>
    }
    player: Player
    mobs: Array<Actor>
    gameOver: boolean
    score: number
    turns: number
    gameDisplay: GameDisplay
    messages: Array<IMessage>
    gameProgress: GameProgress
    showInfectable: boolean

    dirty: boolean
    director: Director
    constructor(scheduler: ROT.Scheduler) {
        this.maps = new Maps(this)
        this.scheduler = scheduler
        this.display = null
        this.map = {}
        this.decorations = {}
        this.player = null
        this.mobs = []
        this.gameOver = false
        this.score = 0
        this.turns = 0
        this.messages = []
        this.gameProgress = new GameProgress()
        this.dirty = false
        this.director = undefined
        this.gameDisplay = new GameDisplay(this)
        this.showInfectable = false
    }

    getBosses() {
        return this.mobs.filter(m => m.boss)
    }

    allBossesDown() {
        let bosses: Boolean[] = []
        Object.keys(this.gameProgress).forEach(key => {
            bosses.push(this.gameProgress[key].bossDown)
        })

        return _.every(bosses) || this.gameProgress.level4.bossDown
    }

    levelBossPassed() {
        return this.getGameProgress().bossDown
    }

    _setTiles(imgsrc: ImageData) {
        if (Config.tiles) {
            let tileSet = this.display.getOptions().tileSet
            if (tileSet.src !== imgsrc) {
                tileSet.src = imgsrc
            }
        }
    }

    swapTiles(idx: number) {
        if (Config.tiles) {
            let options = this.display.getOptions()
            if (idx % 2 === 0) {
                options.tileSet.src = this.getGameProgress().tiles
            }

            if (idx % 2 === 1) {
                options.tileSet.src = this.getGameProgress().tilesf2
            }
            this._drawFov()
        }
    }

    init() {
        let optionsAscii = {
            width: Config.gamePortWidth,
            height: Config.gamePortHeight,
            fontSize: Config.fontSize,
            forceSquareRatio: true,
            fontStyle: "bold"
        }

        console.log('game init', this)
        this.gameDisplay.restartGui()
        // this.gameDisplay.updateGui()

        let tileSet = new Image()
        if (Config.tileWidth === 8) {
            // tileSet.src = ReTiles1
        } else if (Config.tileWidth === 16) {
            // tileSet.src = ReTiles2
            // tileSet.src = ReTiles16
            tileSet.src = ReTiles16Catacombs
        } else if (Config.tileWidth === 32) {
            // tileSet.src = ReTiles4
        }

        let tileWidth = Config.tileWidth
        let optionsTiles = {
            layout: 'tile',
            // bg: 'transparent',
            tileWidth: tileWidth,
            tileHeight: tileWidth,
            tileSet: tileSet,
            tileMap: this.maps.getTileMap(),
            width: Config.gamePortWidth,
            height: Config.gamePortHeight
        }

        if (Config.tiles) {
            this.display = new ROT.Display(optionsTiles);
        } else {
            this.display = new ROT.Display(optionsAscii);
        }

        let mapElem = document.getElementById("mapContainer")
        if (mapElem) {
            document.getElementById("mapContainer").innerHTML = ''
            document.getElementById("mapContainer").appendChild(this.display.getContainer())
        }

        this.generateMap(this.maps.mapMap()["lab"])
    }

    resetLevel() {
        this.map = {}
        this.display.clear()
        this.mobs = []
    }

    getFreeCells() {
        // console.log("getFreeCells() this.map", this.map)
        let freeCells: Array<string> = []
        Object.keys(this.map).forEach(key => {
            if (this.map[key] === '.') {
                freeCells.push(key)
            }
        })
        return freeCells
    }

    getCharacterAt(mover: Actor, x: number, y: number) {
        let actor: Actor
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

    generateMap(mapspec: IMapSpec) {
        // TODO change interfaces etc to type defs from ROT
        //@ts-ignore
        let generator = new mapspec._obj(Config.gamePortWidth, Config.gamePortHeight, mapspec)

        var freeCells: Array<string> = [];

        var digCallback = function (x: number, y: number, value: string) {
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
            this._drawWholeMap();
        }

        if (!this.player) {
            this.player = this._createBeingPlayer(Player, freeCells)
        } else {
            let { x, y } = this._getRandomMapLocation()
            this.player.x = x
            this.player.y = y
            this.player.draw()
        }
    }

    _getRandomMapLocation() {
        let freeCells = this.getFreeCells()
        let index = Math.floor(ROT.RNG.getUniform() * freeCells.length)
        let key = freeCells.splice(index, 1)[0]
        let parts = key.split(",")
        return {
            x: parseInt(parts[0]),
            y: parseInt(parts[1])
        }
    }

    _drawWholeMap() {
        // console.log('decorations', this.decorations)
        for (var key in this.map) {
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            if (this.decorations[key]) {
                let decorations = _.clone(this.decorations[key])
                decorations.unshift(this.map[key])
                console.log('drawing decorations', decorations)
                this.display.draw(x, y, decorations)
            } else {

                this.display.draw(x, y, this.map[key]);
            }

        }
        // console.log("Player", this.player && this.player.hp)
    }

    createBeingMonster(what: new (x: number, y: number, game: Game, mobspec: MobSpec) => Actor, freeCells: Array<string>, mobspec?: MobSpec) {
        // console.log('freeCells', freeCells.sort().join('|'))
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length)
        var key = freeCells.splice(index, 1)[0]
        var parts = key.split(",")
        var x = parseInt(parts[0])
        var y = parseInt(parts[1])
        if (this.player) {
            // console.log('creating mob ', mobspec.name, ' at ', x, y, 'player at', this.player.getX(), this.player.getY())
        }
        return new what(x, y, this, mobspec)
    }

    _createBeingPlayer(what: new (x: number, y: number, game: Game) => Actor, freeCells: Array<string>) {
        return <Player>this.createBeingMonster(what, freeCells)
    }

    getGameProgress() {
        let key = "level" + this.currentLevel
        return this.gameProgress[key]
    }

    killBoss() {
        this.getGameProgress().style = "text-decoration: line-through; color: red"
        this.message(`You killed the level boss.  Press > to go to The ${this.director.getNextLevelDescription()}.`, true)
        this.getGameProgress().bossDown = true
    }

    possesBoss() {
        this.getGameProgress().style = "color: purple"
        this.getGameProgress().text += " [Infected]"
        this.message(`You infected the level boss.  Press > to go to The ${this.director.getNextLevelDescription()}.`, true)
        this.getGameProgress().bossDown = true
    }

    message(msg: string, important?: boolean) {
        let message = {
            msg: msg,
            turn: this.turns,
            important: important
        }
        this.messages.unshift(message)
    }

    dmgMessage(msg: string, important: boolean, source: string, target: string, actorSource: Actor) {
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
    }


    updateGui() {
        this.gameDisplay.updateGui()
    }

    addScore(x: number) {
        this.score += x
    }

    resetScore() {
        this.score = 0
    }

    redraw() {
        let imageSrc = this.getGameProgress().tiles
        this._setTiles(imageSrc)
        this.display.clear()
        if (Config.debug && Config.drawWholeMap) {
            this._drawWholeMap()
        }
        this._drawFov()
    }

    _drawFov() {
        // TODO liked trent reznor 'on we march' for background music
        let fovFloorColor = this.getGameProgress().floorColor
        let fovWallColor = this.getGameProgress().wallColor

        let map = this.map

        function lightPasses(x: number, y: number) {
            let key = x + ',' + y
            if (key in map) { return (map[key] === '.') }
            return false
        }

        let fov = new ROT.FOV.PreciseShadowcasting(lightPasses)



        fov.compute(this.player.x, this.player.y, this.player.sightRadius, (x, y, r, visibility) => {
            let ch = r ? "" : "@"
            // let color = map[x + "," + y] ? "#aa0" : "#660"
            let color = map[x + "," + y] ? fovFloorColor : fovWallColor
            if (Config.tiles) {
                let isFloor = map[x + ',' + y]
                if (ch === "@") { // actor
                    this.display.draw(x, y, ['.', "@"])
                } else if (isFloor) { // floor
                    // this.display.draw(x, y, ".")

                    let key = x + ',' + y
                    if (this.decorations[key]) {
                        let decorations = _.clone(this.decorations[key])
                        // decorations.unshift(this.map[key])
                        decorations.unshift('.')
                        // console.log('drawing decorations', decorations)
                        this.display.draw(x, y, decorations)
                    } else {
                        // this.display.draw(x, y, this.map[key]);
                        this.display.draw(x, y, ".")
                        // this.visibleSquares.push(x + ',' + y)
                    }
                } else { // wall
                    ch = this.maps.getWallIndicator(x, y)
                    this.display.draw(x, y, ch)
                }
            } else {
                this.display.draw(x, y, ch, this.player.color, color)
            }
        })

        if (Config.drawAllMobs) {
            this.mobs.forEach(m => m.drawMe())
        } else {
            this.getVisibleMobs().forEach(m => m.drawMe(fovFloorColor))
        }
        if (this.player.isTargetMode() && this.cursor) {
            this.cursor.drawMe()
        }
    }



    _getVisibleSquares() {

        let map = this.map
        function lightPasses(x: number, y: number) {
            let key = x + ',' + y
            if (key in map) { return (map[key] === '.') }
            return false
        }

        let fov = new ROT.FOV.PreciseShadowcasting(lightPasses)

        let squares: any = []
        fov.compute(this.player.x, this.player.y, this.player.sightRadius, (x, y, r, visibility) => {
            squares.push(x + ',' + y)
        })

        return squares
    }

    getDisplayMobs() {
        if (this.showInfectable) {
            return this.getInfectableMobs()
        }
        return this.getVisibleMobs()
    }

    getVisibleMobs() {
        let visibleMobs = _.filter(this.mobs, m => _.findIndex(this._getVisibleSquares(), i => i === m.x + ',' + m.y) >= 0)

        visibleMobs.forEach(m => m.setSeen())
        return visibleMobs
    }

    getInfectableMobs() {
        let mobs = _.filter(this.getVisibleMobs(), m => m.isInfectable())
        // console.log("infectable mobs", mobs)
        let reviveMob = new Monster(0, 0, this, Tyrant)
        reviveMob.isRevive = true
        reviveMob.name = "Revive Tyrant"
        mobs.push(reviveMob)
        return mobs
    }

    destroyMob(actor: Actor) {
        // console.log('destroying', actor)
        _.remove(this.mobs, actor)
        this.scheduler.remove(actor)
        this.addScore(actor.score)
        actor.draw('.', 'red')
    }

    reschedule() {
        this.scheduler.clear()
        this.scheduler.add(this.player, true)
        this.mobs.forEach(m => {
            this.scheduler.add(m, true)
        })
        //  console.log('reschedule', this.scheduler)
    }
}
