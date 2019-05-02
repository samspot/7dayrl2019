
import { Ability } from './abilities';
import { YouWinAction } from './actions';
import Config from './config';
import { Game } from './game';

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
    shouldDrawOtherCharacters: boolean
    bio: string
    quote: string
    nickname: string
    constructor(x: number, y: number, symbol: string, color: string, game: Game) {
        this.x = x
        this.y = y
        this.symbol = symbol
        this.color = color
        this.game = game
        this.boss = false
        this.finalBoss = false
        this.abilities = []
        this.score = 0
        this.isRevive = false
        this.shouldDrawOtherCharacters = false
    }

    _drawOtherCharacters() {
        return this.shouldDrawOtherCharacters
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

        if (this.boss && !this.playerSeen()) {
            console.log('boss trying to take', dmg, ' but not yet seen by player', this.hp, '/', this.maxHp)

            return
        }
        this.hp -= dmg
        if (this.hp <= 0 && !this.isPlayer()) {
            let key = this.x + "," + this.y
            if (!this.game.decorations[key]) {
                this.game.decorations[key] = []
            }
            console.log('adding decoration')
            this.game.decorations[key].push('b')

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
    }

    useAbility(ability: Ability) {
        // console.log("player.useAbility()", ability)

        if (ability && ability.cooldown === 0) {
            // this.game.display.drawText(0, 0, TARGET_HELP);
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
            let characters = ['.', symbolToDraw]
            if (this._drawOtherCharacters()) {
                let mob = this.game.getCharacterAt(this, this.x, this.y)
                if (mob) {
                    // console.log('drawing over mob', symbolToDraw, mob)
                    characters = ['.', mob.symbol, symbolToDraw]
                } else {
                    characters = ['.', symbolToDraw]
                }
            }
            this.game.display.draw(this.x, this.y, characters)

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

}

// TODO: WHY?
class Cursor extends Actor {
    constructor(x: number, y: number, game: Game) {
        super(x, y, '#', 'white', game)
    }
}