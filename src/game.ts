import * as _ from 'lodash'
import * as ROT from 'rot-js'
import { Player } from './player'
import { Monster } from './monster'
import { Director } from './director'
import Config from './config'

import { GameDisplay } from './display'
import { Maps, IMapSpec } from './maps'
import Tyrant from 'assets/tyrant.json'
import { Actor } from './actor'
import { Cursor } from './cursor'

// import ReTiles1 from '../assets/img/re-tiles-1.png'
// import ReTiles2 from '../assets/img/re-tiles-2.png'
// import ReTiles4 from '../assets/img/re-tiles-4.png'
import ReTiles16Lab from '../assets/img/re-tiles-16-lab.png'
import ReTiles16LabF2 from '../assets/img/re-tiles-16-lab-f2.png'
import ReTiles16Catacombs from '../assets/img/re-tiles-16-catacombs.png'
import ReTiles16CatacombsF2 from '../assets/img/re-tiles-16-catacombs-f2.png'
import ReTiles16Outside from '../assets/img/re-tiles-16-outside.png'
import ReTiles16OutsideF2 from '../assets/img/re-tiles-16-outside-f2.png'
import ReTiles16Guardhouse from '../assets/img/re-tiles-16-guardhouse.png'
import ReTiles16GuardhouseF2 from '../assets/img/re-tiles-16-guardhouse-f2.png'
import ReTiles16Mansion from '../assets/img/re-tiles-16-mansion.png'
import ReTiles16MansionF2 from '../assets/img/re-tiles-16-mansion-f2.png'

/* feedback

* special abilities like bite can target diagonal, but you cant bump attack that direction, correct?
    - i first noticed when a zombie grabbed me around a corner, I thought I was safe
    - it would be less of a BS moment at first, would increase player power
    - maybe remove some death learning dark souls style?
    - you are supposed to die a lot in these games to learn the mechanics right? lol
    - so if you leave it like it is, it offers a bit more depth
* on the map I saw the letter for a monster, but it did not appear on the monster list until the next turnthe same will happen for updating the target portrait

defect: charge still causing issues
3. Revisit enemy colors
FB: hard to see who is the boss
TODO: charge can take you out of bounds, but this might be fun?
TODO: enemies in the dark can use abilities - decide on this
TODO: Look into showing explored tiles

Descoped

1. status effects like 'grabbed'
2. add "and DIED!" to damage messages that kill
3. mouse controls to ui
4. tiles

*/

// TODO move to monster.js or other class
export class MobSpec {
    symbol: string
    color: string
    name: string
    hp: number
    score: number
    str: number
    sightRadius: number
    bio: string
    quote: string
}

interface Message {
    msg: string
    turn: number
    important: boolean
    source?: string
    target?: string
    actorSource?: Actor
}

class Level {
    level: number
    name: string
    boss: string
    floorColor: string
    wallColor: string
    spawnRate: number
    text: string
    style: string
    bossDown: boolean
    toString: Function = function () {
        return gpToString()
    }
    tiles: ImageData
    tilesf2: ImageData
}

function gpToString() {
    return `${this.name} ${this.boss} bossDown? ${this.bossDown} level:${this.level}`
}

export class Game {
    maps: Maps
    currentLevel: number
    visibleSquares: Array<string>
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
    messages: Array<Message>
    gameProgress: {
        // level0: Level
        // level1: Level
        // level2: Level
        // level3: Level
        // level4: Level
        [key: string]: Level
    }

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
        this.gameDisplay = new GameDisplay(this)
        this.messages = []
        this.gameProgress = {
            level0: new Level(),
            level1: new Level(),
            level2: new Level(),
            level3: new Level(),
            level4: new Level(),
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
        this.gameProgress.level0.tiles = ReTiles16Lab
        this.gameProgress.level0.tilesf2 = ReTiles16LabF2

        this.gameProgress.level1.level = 1
        this.gameProgress.level1.name = "Catacombs"
        this.gameProgress.level1.boss = "Chris Redfield"
        this.gameProgress.level1.floorColor = '#cc9966'
        this.gameProgress.level1.wallColor = '#660033'
        this.gameProgress.level1.spawnRate = 7
        this.gameProgress.level1.text = "Status Unknown"
        this.gameProgress.level1.style = "font-style: italic"
        this.gameProgress.level1.bossDown = false
        this.gameProgress.level1.tiles = ReTiles16Catacombs
        this.gameProgress.level1.tilesf2 = ReTiles16CatacombsF2

        this.gameProgress.level2.level = 2
        this.gameProgress.level2.name = "Garden"
        this.gameProgress.level2.boss = "Barry Burton"
        this.gameProgress.level2.floorColor = '#cc9966'
        this.gameProgress.level2.wallColor = '#006600'
        this.gameProgress.level2.spawnRate = 6
        this.gameProgress.level2.text = "Status Unknown"
        this.gameProgress.level2.style = "font-style: italic"
        this.gameProgress.level2.bossDown = false
        this.gameProgress.level2.tiles = ReTiles16Outside
        this.gameProgress.level2.tilesf2 = ReTiles16OutsideF2


        this.gameProgress.level3.level = 3
        this.gameProgress.level3.name = "Guardhouse"
        this.gameProgress.level3.boss = "Brad Vickers"
        this.gameProgress.level3.floorColor = '#cccc99'
        this.gameProgress.level3.wallColor = '#330066'
        this.gameProgress.level3.spawnRate = 4
        this.gameProgress.level3.text = "Status Unknown"
        this.gameProgress.level3.style = "font-style: italic"
        this.gameProgress.level3.bossDown = false
        this.gameProgress.level3.tiles = ReTiles16Guardhouse
        this.gameProgress.level3.tilesf2 = ReTiles16GuardhouseF2

        this.gameProgress.level4.level = 4
        this.gameProgress.level4.name = "The Mansion"
        this.gameProgress.level4.boss = "Albert Wesker"
        this.gameProgress.level4.floorColor = '#6699cc'
        this.gameProgress.level4.wallColor = '#660033'
        this.gameProgress.level4.spawnRate = 5
        this.gameProgress.level4.text = "Status Unknown"
        this.gameProgress.level4.style = "font-style: italic"
        this.gameProgress.level4.bossDown = false
        this.gameProgress.level4.tiles = ReTiles16Mansion
        this.gameProgress.level4.tilesf2 = ReTiles16MansionF2

        this.dirty = false
        this.director = undefined
    }

    allBossesDown() {
        let bosses: Boolean[] = []
        // let bosses = []
        Object.keys(this.gameProgress).forEach(key => {
            // let typedKey: (keyof this.gameProgress) = <string>key
            bosses.push(this.gameProgress[key].bossDown)
        })

        return _.every(bosses) || this.gameProgress.level4.bossDown
    }

    levelBossPassed() {
        return this.getGameProgress().bossDown
    }

    setTiles(imgsrc: ImageData) {
        if (Config.tiles) {
            let tileSet = this.display.getOptions().tileSet
            if (tileSet.src !== imgsrc) {
                tileSet.src = imgsrc
            }
        }
    }

    swapTiles(idx: number) {

        let options = this.display.getOptions()
        if (idx === 0) {
            options.tileSet.src = ReTiles16Lab
        } else {
            options.tileSet.src = ReTiles16Catacombs
        }
    }

    swapTiles2(idx: number) {
        if (Config.tiles) {
            let options = this.display.getOptions()
            if (idx % 2 === 0) {
                options.tileSet.src = this.getGameProgress().tiles
            }

            if (idx % 2 === 1) {
                options.tileSet.src = this.getGameProgress().tilesf2
            }
            // this.redraw()
            this.drawFov()
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

        document.getElementById("mapContainer").innerHTML = ''
        document.getElementById("mapContainer").appendChild(this.display.getContainer())

        this.generateMap(this.maps.mapMap()["lab"])
    }

    resetLevel() {
        // console.log("game resetLevel()")
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
            this.drawWholeMap();
        }

        if (!this.player) {
            this.player = this.createBeingPlayer(Player, freeCells)
        } else {
            let { x, y } = this.getRandomMapLocation()
            this.player.x = x
            this.player.y = y
            this.player.draw()
        }
    }

    getRandomMapLocation() {
        let freeCells = this.getFreeCells()
        let index = Math.floor(ROT.RNG.getUniform() * freeCells.length)
        let key = freeCells.splice(index, 1)[0]
        let parts = key.split(",")
        return {
            x: parseInt(parts[0]),
            y: parseInt(parts[1])
        }
    }

    createPlayer() {
        /*
        var index = Math.floor(ROT.RNG.getUniform * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0])
        var y = parseInt(parts[1])
        */
        let { x, y } = this.getRandomMapLocation()
        this.player = new Player(x, y, this)
    }

    drawWholeMap() {
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

    // createBeing(what: Object, freeCells: Array<string>, mobspec?: MobSpec) {
    createBeingMonster(what: new (x: number, y: number, game: Game, mobspec: MobSpec) => Actor, freeCells: Array<string>, mobspec?: MobSpec) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length)
        var key = freeCells.splice(index, 1)[0]
        var parts = key.split(",")
        var x = parseInt(parts[0])
        var y = parseInt(parts[1])
        return new what(x, y, this, mobspec)
    }

    createBeingPlayer(what: new (x: number, y: number, game: Game) => Actor, freeCells: Array<string>) {
        return <Player>this.createBeingMonster(what, freeCells)
        /*
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length)
        var key = freeCells.splice(index, 1)[0]
        var parts = key.split(",")
        var x = parseInt(parts[0])
        var y = parseInt(parts[1])
        return new what(x, y, this)
        */
    }

    gameover(msg: string) {
        alert(msg)
        // this.game.scheduler.remove(this)
        this.scheduler.clear()
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
        // TODO: replace 'next level' with the name of the level
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
        this.gameDisplay.drawMessages()
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
        this.gameDisplay.drawMessages()
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
        this.setTiles(imageSrc)
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
        let fovFloorColor = this.getGameProgress().floorColor
        let fovWallColor = this.getGameProgress().wallColor

        let map = this.map

        function lightPasses(x: number, y: number) {
            let key = x + ',' + y
            if (key in map) { return (map[key] === '.') }
            return false
        }

        let fov = new ROT.FOV.PreciseShadowcasting(lightPasses)

        this.visibleSquares = []
        fov.compute(this.player.x, this.player.y, this.player.sightRadius, (x, y, r, visibility) => {
            let ch = r ? "" : "@"
            // let color = map[x + "," + y] ? "#aa0" : "#660"
            let color = map[x + "," + y] ? fovFloorColor : fovWallColor
            this.visibleSquares.push(x + ',' + y)
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
