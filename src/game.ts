import Tyrant from 'assets/tyrant.json';
import * as _ from 'lodash';
import { Scheduler, Display, RNG, FOV } from 'rot-js';
import { Actor, Cursor } from './actor';
import Config from './config';
import { Director } from './director';
import { GameDisplay } from './display';
import { IMessage, Messager } from './message';
import { GameProgress } from './Level';
import { Maps, TileMapKey } from './maps';
import { MobSpec } from './MobSpec';
import { Monster } from './monster';
import { Player } from './player';
import { getCoordsAround } from './Level';
import { youWinAction } from './allactions';
import { getRandItem } from './random';

export interface IGameMap {
    [key: string]: string
}

export class Game {
    maps: Maps
    currentLevel: number
    cursor: Cursor
    private scheduler: Scheduler
    display: Display
    map: IGameMap
    decorations: {

        [key: string]: Array<string>
    }
    player: Player
    mobs: Array<Actor>
    gameOver: boolean
    score: number
    turns: number
    gameDisplay: GameDisplay
    gameProgress: GameProgress
    showInfectable: boolean
    deaths: number
    director: Director
    messager: Messager
    constructor(scheduler: Scheduler) {
        this.messager = new Messager()
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
        this.gameProgress = new GameProgress()
        this.director = undefined
        this.gameDisplay = new GameDisplay(this)
        this.showInfectable = false
        this.deaths = 0
    }

    schedule(actor: Actor, repeat?: boolean) {
        // console.log("Scheduling actor", actor.name)
        this.scheduler.add(actor, repeat)
    }

    clearSchedule() {
        this.scheduler.clear()
    }

    debugSchedule() {
        console.log("DEBUG SCHEDULE", this.scheduler)
    }

    didWin() {
        return this.currentLevel >= 5
    }

    win(shouldResetScore?: boolean) {
        if (shouldResetScore) {
            this.resetScore()
        }

        console.log('all bosses down, you win action')
        youWinAction()(this)
    }

    getBosses() {
        return this.getGameProgress() && this.getGameProgress().bossObj
    }

    allBossesDown() {
        let bosses = this.gameProgress.getBossStatus()
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
            let frameset = this.maps.getFrameSet(options.tileMap)
            if (idx % 4 === 0) {
                frameset.forEach((t: TileMapKey) => {
                    options.tileMap[t.key] = [t.x + Config.tileWidth, t.y]
                })
            }

            if (idx % 4 === 2) {
                frameset.forEach((t: TileMapKey) => {
                    options.tileMap[t.key] = [t.x - Config.tileWidth, t.y]
                })
            }

            if (idx % 2 === 0) {
                let [x, y] = options.tileMap['*']
                options.tileMap['*'] = [x + Config.tileWidth, y]
            }

            if (idx % 2 === 1) {
                let [x, y] = options.tileMap['*']
                options.tileMap['*'] = [x - Config.tileWidth, y]
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

        // console.log('game init', this)
        this.gameDisplay.restartGui()

        let tileSet = new Image()

        let tileWidth = Config.tileWidth
        let optionsTiles = {
            layout: 'tile',
            tileWidth: tileWidth,
            tileHeight: tileWidth,
            tileSet: tileSet,
            tileMap: this.maps.getTileMap(),
            width: Config.gamePortWidth,
            height: Config.gamePortHeight
        }

        if (Config.tiles) {
            this.display = new Display(optionsTiles);
        } else {
            this.display = new Display(optionsAscii);
        }

        /*
        let mapElem = document.getElementById("mapContainer")
        if (mapElem) {
            document.getElementById("mapContainer").innerHTML = ''
            document.getElementById("mapContainer").appendChild(this.display.getContainer())
        }
        */

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

    fixActorOverlap(actor?: Actor) {
        if (!actor) {
            actor = this.player
        }
        let mob = this.getCharacterAt(actor, actor.x, actor.y)
        if (mob) {
            console.log('fixActorOverlap mob', mob)

            let freespots = getCoordsAround(actor.x, actor.y).map(c => {
                //console.log(c)
                return {
                    occupied: this.getCharacterAt(mob, c[0], c[1]),
                    x: c[0],
                    y: c[1]
                }
            })
                .filter(c => !c.occupied)
                .filter(c => this.map[c.x + ',' + c.y] === '.')

            let spot = getRandItem(freespots)
            mob.x = spot.x
            mob.y = spot.y

        }
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

    generateMap(generator: Function) {

        var freeCells: Array<string> = [];

        var digCallback = function (x: number, y: number, value: string) {
            if (value) { return; }
            var key = x + "," + y;
            this.map[key] = ".";
            freeCells.push(key);
        }

        digCallback = digCallback.bind(this)

        generator(Config.gamePortWidth, Config.gamePortHeight, digCallback)

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
        let index = Math.floor(RNG.getUniform() * freeCells.length)
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
                // console.log('drawing decorations', decorations)
                this.display.draw(x, y, decorations)
            } else {

                this.display.draw(x, y, this.map[key]);
            }

        }
        // console.log("Player", this.player && this.player.hp)
    }

    createBeingMonster(what: new (x: number, y: number, game: Game, mobspec: MobSpec) => Actor, freeCells: Array<string>, mobspec?: MobSpec) {
        // console.log('freeCells', freeCells.sort().join('|'))
        var index = Math.floor(RNG.getUniform() * freeCells.length)
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
        return this.gameProgress.getCurrentLevel(this.currentLevel)
    }

    updateGameProgressKill() {
        this.getGameProgress().style = "text-decoration: line-through; color: red"
        this.message(`You killed the level boss.  Find the stairs to the next level.`, true)
    }

    updateGameProgressPossess() {
        this.getGameProgress().style = "color: purple"
        this.getGameProgress().text += " [Infected]"
    }

    onBossDown() {
        this.getGameProgress().bossDown = true
        console.log('onBossDown adding score', this.getGameProgress().score)
        this.score += this.getGameProgress().score
        this.director.spawnStairs()
    }

    getMessager() {
        // return this.messager && this.messager.getMessages()
        return this.messager
    }

    message(msg: string, important?: boolean) {
        this.messager.message(msg, important)
    }

    dmgMessage(msg: string, damage: number, important: boolean, source: string, target: string, actorSource: Actor, hpBefore: number, hpAfter: number) {
        this.messager.dmgMessage(msg, damage, important, source, target, actorSource, hpBefore, hpAfter)
    }

    addScore(x: number) {
        this.score += x
    }

    resetScore() {
        this.score = 0
    }

    setupDraw() {
        let imageSrc = this.getGameProgress().tilesNew
        this._setTiles(imageSrc)
        this.display.clear()
    }

    _drawFov() {
        this.display.clear()
        if (Config.debug && Config.drawWholeMap) {
            this._drawWholeMap()
        }
        // TODO liked trent reznor 'on we march' for background music
        let fovFloorColor = this.getGameProgress().floorColor
        let fovWallColor = this.getGameProgress().wallColor

        let map = this.map

        function lightPasses(x: number, y: number) {
            let key = x + ',' + y
            if (key in map) { return (map[key] === '.') }
            return false
        }

        let fov = new FOV.PreciseShadowcasting(lightPasses)



        fov.compute(this.player.x, this.player.y, this.player.sightRadius, (x, y, r, visibility) => {
            let ch = r ? "" : "@"
            // let color = map[x + "," + y] ? "#aa0" : "#660"
            let color = map[x + "," + y] ? fovFloorColor : fovWallColor
            if (Config.tiles) {
                let isFloor = map[x + ',' + y]
                if (ch === "@") { // actor
                    // TODO Maybe highlight the player here
                    this.display.draw(x, y, ['.', this.player.symbol])
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

        let fov = new FOV.PreciseShadowcasting(lightPasses)

        let squares: string[] = []
        fov.compute(this.player.x, this.player.y, this.player.sightRadius, (x, y, r, visibility) => {
            squares.push(x + ',' + y)
        })

        return squares
    }

    getDisplayMobs() {
        if (this.showInfectable) {
            return this.getInfectableMobs()
        }
        let moblist = this.getVisibleMobs().filter(m => m.name !== 'stairs')
        return moblist.sort((a, b) => this.player.distanceToActor(a) - this.player.distanceToActor(b))

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
        mobs.unshift(reviveMob)
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
        this.clearSchedule()
        this.schedule(this.player, true)
        this.mobs.forEach(m => {
            this.schedule(m, true)
        })
        //  console.log('reschedule', this.scheduler)
    }
}
