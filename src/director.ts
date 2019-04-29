
import * as _ from 'lodash';
import * as ROT from 'rot-js';
import { Ability, EmptySlot, } from './abilities';
import { Actor } from './actor';
import Config from './config';
import { Game } from './game';
import { MobSpec } from "./MobSpec";
import { Monster } from './monster';
import { Player } from './player';
import Barry from 'assets/barry.json';
import Brad from 'assets/brad.json';
import Chris from 'assets/chris.json';
import Jill from 'assets/jill.json';
import Wesker from 'assets/wesker.json';
import Leon from 'assets/leon.json'
import Claire from 'assets/claire.json'
import Ada from 'assets/ada.json'
import Rebecca from 'assets/rebecca.json'
import Birkin from 'assets/birkin.json'
import Hunk from 'assets/hunk.json'
import Krauser from 'assets/krauser.json'
import Billy from 'assets/billy.json'
import Lisa from 'assets/lisa.json'


export class Director {
    player: Player
    game: Game
    countdown: number
    scheduler: ROT.Scheduler
    boss: Actor
    mobs: Array<Actor>
    spawnId: number
    levelTicks: number
    mobSpec: MobSpec
    bossPool: Array<Actor>
    specialMobs: Array<Actor>
    constructor(game: Game, scheduler: ROT.Scheduler) {
        this.player = game.player
        this.game = game
        this.countdown = 5

        this.scheduler = scheduler
        game.currentLevel = 0
        if (Config.debug && Config.startLevel) {
            game.currentLevel = Config.startLevel
        }

        this.boss = null
        this.mobs = []
        this.scheduler.add(this.player, true)
        this.spawnId = 0
        this.levelTicks = 0
        this.mobSpec = new MobSpec()
        // @ts-ignore
        this.bossPool = ROT.RNG.shuffle([Jill, Chris, Barry, Brad, Wesker, Leon, Claire, Rebecca])

        // @ts-ignore
        this.specialMobs = ROT.RNG.shuffle([Ada, Birkin, Hunk, Krauser, Billy, Lisa])
        // this.bossPool.unshift(Ada)
        // this.bossPool.unshift(Rebecca)
        // this.bossPool.unshift(Birkin)
        // this.bossPool.unshift(Hunk)
        // this.bossPool.unshift(Krauser)
        // this.bossPool.unshift(Billy)
    }

    // cleanup all things that need to be cleaned for descending
    resetLevel() {
        this.game.resetLevel()
        this.boss = null
        this.mobs = []
        this.scheduler.clear()
        this.scheduler.add(this.player, true)
        this.levelTicks = 0
    }

    generateAbilities(monster: Actor) {
        // console.log('generating abilities for ', monster)
        let mobAbilities = this.mobSpec.getMobAbilities()[monster.name]
        mobAbilities.forEach((a: new (monster: Monster) => Ability) => {
            // @ts-ignore
            let ability = new a(monster)
            if (ability instanceof EmptySlot) {
                // @ts-ignore
                a = ability.getRandomAbility()
                // @ts-ignore
                ability = new a(monster)
            }

            monster.addAbility(ability)
        })

        // console.log('monster abilities', monster.abilities)
    }

    getLevelName() {
        return this.game.getGameProgress().nickname
    }

    getLevelSpec() {
        let x = this.game.maps.mapMap()[this.getLevelName()]
        // console.log('director.getlevelspec', x, this.getLevelName())
        return x
    }

    nextBoss() {
        let boss = this.bossPool.splice(0, 1)[0]

        console.log(boss.name, 'selected', this.bossPool.map(b => b.name), 'remaining')
        return boss
    }

    tick() {
        this.levelTicks++
        // load any mob changes
        this.mobs = this.game.mobs

        if (!this.boss && this.levelTicks > 5 && Config.spawnboss) {
            // console.log('spawning boss', this.boss, abilities[this.boss.name])
            this.boss = this.nextBoss()

            // @ts-ignore
            let monster = this._createSchedule(this.boss)
            monster.boss = true

            if (this.game.currentLevel === 4) {
                console.log('last level boss spawned')
                monster.finalBoss = true
            }

            this.mobs.push(monster)

            this.boss = monster

            this.game.getGameProgress().text = this.boss.name
            this.game.getGameProgress().bossNickName = this.boss.nickname
            this.game.getGameProgress().bossObj = monster
        }

        this.countdown--
        if (this.countdown <= 0 && !this.game.getGameProgress().bossDown) {
            let spawnrate = this.game.getGameProgress().spawnRate
            // console.log(`spawnrate ${spawnrate}`)

            if (window.directorsCut) {
                spawnrate = 2
            }

            if (Config.debug && Config.spawnrate) {
                spawnrate = Config.spawnrate
            }

            let minimum = Config.spawnrate / 2

            let num = Math.abs(Math.floor(ROT.RNG.getNormal(0, spawnrate)))
            if (num < minimum) {
                num = minimum
            }

            this.countdown = num

            // @ts-ignore
            if (!this.getLevelSpec().mobs) { this.getLevelSpec().mobs = 0 }
            if (window.directorsCut) {
                // console.log("directors cut set spawn limit 100")
                Config.spawnLimit = 100
            }
            // @ts-ignore
            if (this.getLevelSpec().mobs < Config.spawnLimit) {
                // console.log('spawn', this.getLevelSpec())
                let mobspec = this._generateMob()

                let monster = this._createSchedule(mobspec)
                this.mobs.push(monster)
                // @ts-ignore
                this.getLevelSpec().mobs++
            }
        }

        // save any mob changes
        this.game.mobs = this.mobs
    }

    _createSchedule(mobspec: MobSpec) {
        let freeCells = this.game.getFreeCells()
        let cellsRemoved: any = []

        // console.log('visible', this.game._getVisibleSquares().sort().join('|'))
        // console.log('player at', this.game.player.getX(), this.game.player.getY())
        this.game._getVisibleSquares().forEach((x: any) => {
            _.remove(freeCells, c => {
                if (c === x) {
                    cellsRemoved.push(c)
                    return true
                }
                return false
            })
        })

        // console.log("cells removed", cellsRemoved)
        // console.log('cellsRemoved', cellsRemoved)
        // console.log('freeCells', freeCells)
        // console.log('player', this.game.player.x, this.game.player.y)
        let monster = this.game.createBeingMonster(Monster,
            freeCells, mobspec)
        // console.log('monster', monster.x, monster.y)

        this.spawnId++
        monster.spawnId = this.spawnId
        // console.log(`spawn-${monster.spawnId} monster add ${monster.x},${monster.y} ${monster.name}`)

        this.scheduler.add(monster, true)
        this.generateAbilities(monster)
        return monster
    }

    _generateMob() {
        let mob
        let randomChance = 0.95 // 0.9
        let scoreThreshold = 15000 // 15000
        let rand = ROT.RNG.getUniform()
        if (this.game.score >= scoreThreshold && rand >= randomChance && this.specialMobs.length > 0) {
            mob = this.specialMobs.splice(0, 1)[0]
        } else {
            // @ts-ignore
            mob = ROT.RNG.getItem(this.mobSpec.getMobsByLevel()[this.getLevelName()])
        }
        // console.log('rand', rand, 'score', this.game.score, 'deaths', this.game.deaths, 'spawning', mob)
        return mob
    }

    _debugScheduler() {
        var turns = [];
        for (var i = 0; i < 20; i++) {
            var current = this.scheduler.next();
            turns.push(current.symbol);
        }
        console.dir("turn order " + turns.join(" "))
    }
}
