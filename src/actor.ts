
import * as ROT from 'rot-js'
import Tyrant from 'assets/tyrant.json'
import Zombie from 'assets/zombie.json'
import Jill from 'assets/jill.json'
import Config from './config';
import { Game } from './game'
import { Ability } from './abilities'
import { Cursor } from './cursor'
import { YouWinAction } from './actions';

const TARGET_HELP = "Move your targetting cursor (#) with the directional keys.  ESC to cancel, ENTER to confirm target"

const TARGETTING = "state_targetting"
export class Actor {
    x: number
    y: number
    state: string
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
    usingAbility: Ability
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

    // @ts-ignore
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
                    return new YouWinAction(this.game.player)
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

    useAbility(ability: Ability) {
        // console.log("player.useAbility()", ability)

        if (ability && ability.cooldown === 0) {
            this.game.display.drawText(0, 0, TARGET_HELP);
            // console.log("abilty available", ability.cooldown, ability.maxCooldown)
            this.state = TARGETTING
            this.usingAbility = ability
            this.game.cursor = new Cursor(this.x, this.y, this.game)
        }
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