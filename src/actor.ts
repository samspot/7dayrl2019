
import * as ROT from 'rot-js'
import Tyrant from 'assets/tyrant.json'
import Zombie from 'assets/zombie.json'
import Jill from 'assets/jill.json'
import { YouWinAction } from './actions'
import Config from './config';
import { Game } from './game'
import { Ability } from './abilities.js'

export class Actor {
    x: number
    y: number
    symbol: string
    color: string
    game: Game
    boss: boolean
    finalBoss: boolean
    abilities: Array<Ability>
    score: number
    isRevive: boolean
    seen: boolean
    hp: number
    maxHp: number
    spawnId: number
    name: string
    str: number
    sightRadius: number
    constructor(x: number, y: number, symbol: string, color: string, game: Game) {
        this.x = x
        this.y = y
        this.symbol = symbol
        this.color = color
        this.game = game
        // this.draw()
        this.boss = false
        this.finalBoss = false
        this.abilities = []
        this.score = 0
        this.isRevive = false

        // console.log("Tyrant", Tyrant.hp, "Zombie", Zombie.hp, "Jill", Jill.hp)
    }

    setSeen() {
        if (this.boss && !this.seen) {
            this.game.gameDisplay.drawBossSplash(this)
        }
        this.seen = true
    }

    playerSeen() {
        return this.seen
    }

    isInjured() {
        // console.log(`is ${this.name} ${this.hp}/${this.maxHp} less than ${this.maxHp * .45}`)
        return this.hp < this.maxHp * .45
    }

    isInfectable() {
        if (this.finalBoss) { return false }
        return this.isInjured() || this.hp < 15
    }

    damage(dmg: number) {
        if (this.isPlayer() && Config.debug && Config.playerInvulnerable) {
            return
        }
        // if(this.boss){
        // console.log(`${dmg} vs ${this.name} ${this.hp} seen ${this.playerSeen()}`)
        // }
        if (this.boss && !this.playerSeen()) {
            return
        }
        this.hp -= dmg
        if (this.hp <= 0 && !this.isPlayer()) {
            // TODO below if is repeated, but we need to add player logic here from actions.js
            if (!this.isPlayer()) {
                this.game.destroyMob(this)
            }

            if (this.isBoss()) {
                this.game.killBoss()

                if (this.game.allBossesDown()) {
                    return new YouWinAction()
                }
            }
        }
    }

    tickAbilities() {
        this.abilities.forEach(a => a.tick())
    }

    addAbility(ability: Ability) {
        this.abilities.push(ability)
    }

    getAbilities() {
        return this.abilities
    }

    isPlayer() {
        return false
    }

    isBoss() {
        return this.boss
        // return true
    }

    draw(symbol?: string, color?: string, bgColor?: string) {
        let symbolToDraw = this.symbol
        let colorToDraw = this.color
        if (symbol) {
            symbolToDraw = symbol
            colorToDraw = color
        }
        if (Config.tiles) {
            // this.game.display.draw(this.x, this.y, [symbolToDraw, '.'])
            this.game.display.draw(this.x, this.y, ['.', symbolToDraw])
        } else {
            this.game.display.draw(this.x, this.y,
                symbolToDraw, colorToDraw, bgColor)
        }
        // console.log(this.name, this.hp)
    }

    drawMe(bgColor?: string) {
        this.draw(this.symbol, this.color, bgColor)
    }

    getX() {
        return this.x
    }

    getY() {
        return this.y
    }

    out() {
        return this.symbol + ' ' + this.x + ',' + this.y
    }
}
