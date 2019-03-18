import Barry from 'assets/barry.json';
import Brad from 'assets/brad.json';
import Chimera from 'assets/chimera.json';
import Chris from 'assets/chris.json';
import Dog from 'assets/dog.json';
import Hunter from 'assets/hunter.json';
import Jill from 'assets/jill.json';
import Lisa from 'assets/lisa.json';
import Shark from 'assets/shark.json';
import Spider from 'assets/spider.json';
import Wesker from 'assets/wesker.json';
import Zombie from 'assets/zombie.json';
import * as _ from 'lodash';
import * as ROT from 'rot-js';
import { Ability, Bite, Charge, EmptySlot, Grab, GrenadeLauncher, Haymaker, Impale, Magnum, Poison, Shotgun } from './abilities';
import { Actor } from './actor';
import Config from './config';
import { Game } from './game';
import { MobSpec } from "./MobSpec";
import { Monster } from './monster';
import { Player } from './player';

// TODO move most of this to Level.ts
const levels = [
    'lab',
    'catacombs',
    'outside',
    'guardhouse',
    'mansion'
]

const levelNames = {
    'lab': 'Laboratory',
    'catacombs': 'Catacombs',
    'outside': 'Garden',
    'guardhouse': 'Guardhouse',
    'mansion': 'Mansion'
}

const mobs = {
    'lab': [Zombie, Zombie, Chimera],
    'catacombs': [Zombie, Hunter, Spider, Spider, Zombie, Zombie, Hunter, Spider, Lisa], // SpiderBoss
    'outside': [Zombie, Dog, Dog, Spider],
    'guardhouse': [Zombie, Spider, Spider, Shark], // Plant, Plant42
    'mansion': [Zombie, Zombie, Hunter, Hunter], //Snake
}

const bosses = {
    'lab': Jill,
    'catacombs': Chris,
    'outside': Barry,
    'guardhouse': Brad,
    'mansion': Wesker
}

const abilities: { [key: string]: Array<Object> } = {
    'Jill Valentine': [GrenadeLauncher, EmptySlot],
    'Chris Redfield': [Shotgun, EmptySlot],
    'Barry Burton': [Magnum, EmptySlot],
    'Brad Vickers': [Shotgun, EmptySlot],
    'Albert Wesker': [Magnum, EmptySlot],
    'Tyrant': [Charge, Impale],
    'Zombie': [Grab],
    'Chimera': [Grab, Charge],
    'Dog': [Grab, Bite],
    'Hunter': [Bite, Charge],
    'Lisa Trevor': [Grab, Haymaker],
    'Plant': [Poison],
    'Plant 42': [Grab, Poison],
    'Shark': [Bite],
    'Snake Boss': [Bite, Poison],
    'Giant Spider': [Bite, Poison],
    'Black Tiger': [Bite, Poison, Charge]
}


export class Director {
    player: Player
    game: Game
    countdown: number
    scheduler: ROT.Scheduler
    boss: Actor
    mobs: Array<Actor>
    spawnId: number
    levelTicks: number
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
    }

    // cleanup all things that need to be cleaned for descending
    resetLevel() {
        this.game.resetLevel()
        this.boss = null
        this.mobs = []
        this.scheduler.clear()
        this.scheduler.add(this.player, true)
    }

    generateAbilities(monster: Actor) {
        // console.log('generating abilities for ', monster)
        let mobAbilities = abilities[monster.name]
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
        return levels[this.game.currentLevel]
    }

    getNextLevelDescription() {
        // @ts-ignore
        return levelNames[levels[this.game.currentLevel + 1]]
    }

    getLevelSpec() {
        // return Maps[this.getLevelName()]
        return this.game.maps.mapMap()[this.getLevelName()]
    }

    tick() {
        this.levelTicks++
        // load any mob changes
        this.mobs = this.game.mobs

        if (!this.boss && this.levelTicks > 5 && Config.spawnboss) {
            // @ts-ignore
            this.boss = bosses[levels[this.game.currentLevel]]
            // console.log('spawning boss', this.boss, abilities[this.boss.name])

            // @ts-ignore
            let monster = this._createSchedule(this.boss)
            monster.boss = true

            if (this.boss.name === "Albert Wesker") {
                monster.finalBoss = true
            }

            this.mobs.push(monster)

            this.boss = monster

            this.game.getGameProgress().text = this.boss.name
        }

        this.countdown--
        if (this.countdown <= 0 && !this.game.getGameProgress().bossDown) {
            let spawnrate = this.game.getGameProgress().spawnRate
            // console.log(`spawnrate ${spawnrate}`)

            if (window.directorsCut) {
                // console.log("directors cut spawn rate 2")
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

    // TODO make sure bosses cant spawn in vision
    _createSchedule(mobspec: MobSpec) {
        let freeCells = this.game.getFreeCells()
        let cellsRemoved = []
        this.game.visibleSquares.forEach(x => {
            _.remove(freeCells, c => {
                if (c === x) {
                    cellsRemoved.push(c)
                    return true
                }
                return false
            })
        })
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
        // @ts-ignore
        let mob = ROT.RNG.getItem(mobs[levels[this.game.currentLevel]])
        // console.log(mob)
        // this.mobs.push(mob)
        return mob
    }


    // debug the scheduler
    _debugScheduler() {
        var turns = [];
        for (var i = 0; i < 20; i++) {
            var current = this.scheduler.next();
            turns.push(current.symbol);
        }
        console.dir("turn order " + turns.join(" "))
    }
}