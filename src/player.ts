import Tyrant from 'assets/tyrant.json';
import * as _ from 'lodash';
import * as ROT from 'rot-js';
import { Ability, Charge, Impale, Infect, Grab } from './abilities';
import { AbilityAction, DefaultAction, DescendAction, MoveAction } from './actions';
import { Actor } from './actor';
import Config from './config';
import { Game } from './game';
import { keyMap } from './keymap';

const TARGETTING = "state_targetting"
const PLAYER_TURN = "state_playerturn"
const TARGET_HELP = "Move your targetting cursor (#) with the directional keys.  ESC to cancel, ENTER to confirm target"

export class Player extends Actor {
    debugCount: number
    resolve: Function
    reject: Function
    splash: boolean
    constructor(x: number, y: number, game: Game) {
        super(x, y, "@", "#ff0", game)

        this.nickname = Tyrant.nickname
        this.name = Tyrant.name
        // this.name= "Giant Spider"
        this.hp = Tyrant.hp
        this.maxHp = this.hp
        this.str = Tyrant.str
        this.color = Tyrant.color
        this.sightRadius = Tyrant.sightRadius

        this.addAbility(new Impale(this))
        //this.addAbility(new Grab(this))
        this.addAbility(new Charge(this))
        this.addAbility(new Infect(this))

        this.state = PLAYER_TURN
        // make the game advance a few turns on startup
        this.debugCount = 0
        if (Config.debug) {
            this.debugCount = Config.turnsToSim
        }
    }

    revive() {
        this.name = Tyrant.name
        this.nickname = Tyrant.nickname
        this.hp = Tyrant.hp
        this.maxHp = this.hp
        this.color = Tyrant.color
        this.str = Tyrant.str
        this.sightRadius = Tyrant.sightRadius
        this.boss = false
        this.abilities = []
        this.addAbility(new Impale(this))
        this.addAbility(new Charge(this))
        this.addAbility(new Infect(this))
    }

    infectMob(mob: Actor) {
        this.name = mob.name
        this.nickname = mob.nickname
        this.symbol = mob.symbol
        this.hp = mob.maxHp * 1.5
        if (this.hp < 150) { this.hp = 150 }
        this.maxHp = this.hp
        this.color = mob.color
        this.str = mob.str
        this.x = mob.x
        this.y = mob.y
        this.sightRadius = mob.sightRadius
        this.boss = false

        this.abilities = []

        let hasImpale = false
        _.clone(mob.abilities).forEach(a => {
            // console.log('adding ability', a)
            a.actor = this
            this.addAbility(_.clone(a))
            if (a.constructor.name === 'Impale') { hasImpale = true }
        })
        if (!hasImpale) {
            // this.addAbility(new Impale(this))
        }
        this.addAbility(new Infect(this))
    }

    isTargetMode() {
        return this.state === TARGETTING
    }

    isPlayer() {
        return true
    }
    act() {
        if (this.debugCount > 0) {
            this.debugCount--

            if (Config.debug) {
                // ecg 70w x 80h
                // this.game.message("this is a very long messaged designed to break the web layout.  resident evil is so fun. don't open that door!  I ahve THIS!   I hope this is not Chris's blood! You were almost a jill sandwich!")
            }
            return new Promise(resolve => {
                this.resolve = resolve
                this.resolve(new DefaultAction())
            })
        }
        // console.log('Player act')
        window.addEventListener("keydown", this);
        window.addEventListener("keypress", this);
        return new Promise((resolve, reject) => {

            this.resolve = resolve
            this.reject = reject
        })
    }

    getInfectStr() {
        let infect = 20
        if (this.str > 20) {
            infect = this.str
        }
        return infect
    }

    handleTarget(e: Event) {
        // console.log("targetting")

        //@ts-ignore
        let charCode = e.which || e.keyCode
        let charStr = String.fromCharCode(charCode)

        // escape key
        //@ts-ignore
        if (charCode === 27 || charCode === ROT.KEYS.VK_Q || charCode === ROT.KEYS.VK_E || charCode === ROT.KEYS.VK_R) {
            this.game.gameDisplay.hideModal()
            this.state = PLAYER_TURN
            this.game.redraw()
            // this.game.dirty = true
            return
        }
        if (this.splash) {
            return;
        }

        // Enter key
        if (charCode === 13) {
            this.game.gameDisplay.hideModal()
            // console.log("enter key, do ability", this)
            // ability.cooldown = ability.maxCooldown

            if (!this.usingAbility.canTargetEmpty() && !this.game.getCharacterAt(null, this.game.cursor.x, this.game.cursor.y)) {
                console.log('no character at target loc, cancelling target')
                this.game.redraw()
                this.state = PLAYER_TURN
                return
            }

            this.resolve(new AbilityAction(this.game.player, this.usingAbility,
                this.game.cursor.x, this.game.cursor.y))
            this.usingAbility = null
            this.state = PLAYER_TURN
            this.game.dirty = true
            return
        }

        if (!(charCode in keyMap)) { return }
        e.preventDefault()

        let cursor = this.game.cursor
        if (cursor) {

            //@ts-ignore
            var diff = ROT.DIRS[8][keyMap[charCode]];
            let newX = cursor.x + diff[0];
            let newY = cursor.y + diff[1];

            // this.game.display.drawText(0, 0, TARGET_HELP);
            // TODO: also make sure path is clear, don't shoot through walls
            if (this.inRange(this.usingAbility, this, newX, newY)) {
                this.game.cursor.x = newX
                this.game.cursor.y = newY

                this.game.redraw()
                // this.game.display.drawText(0, 0, TARGET_HELP);
                cursor.drawMe()
            }
        }
    }

    inRange(ability: Ability, actor: Actor, x: number, y: number) {
        let distance = Math.sqrt((x - actor.x) ** 2 + (y - actor.y) ** 2)
        distance = Math.floor(distance)
        // console.log('distance', distance, 'range', ability.range)
        return distance <= ability.range
    }

    // TODO: Tank controls?
    handleEvent(e: Event) {
        if (this.state === TARGETTING) {
            // this.game.display.drawText(0, 0, TARGET_HELP);
            return this.handleTarget(e)
        }
        // console.log('handle event', e)
        // @ts-ignore
        let charCode = e.which || e.keyCode
        let charStr = String.fromCharCode(charCode)

        if (charStr == '>') {
            this.tickAbilities()
            this.resolve(new DescendAction(this))
        }

        // escape key or enter key
        if (charCode === 27 || charCode === 13) {
            this.game.gameDisplay.hideModal()
            return
        }

        if (this.splash) {
            return
        }
        // var code = e.keyCode;
        var code = charCode
        // enter or space
        if (code == 13 || code == 32) {
            // console.log("key hit for pickup action")
            // let action = new PickupAction(this)
            // this.tickAbilities()
            // this.resolve(action)
            return
        }

        let abilitykeys = [
            //@ts-ignore
            ROT.KEYS.VK_Q,
            //@ts-ignore
            ROT.KEYS.VK_E,
            //@ts-ignore
            ROT.KEYS.VK_R
        ]
        let result = _.findIndex(abilitykeys, x => x === code)
        if (result >= 0) {
            // console.log('pressed ability key', result)

            this.useAbility(this.abilities[result])
            this.game.redraw()
            return
        }

        if (code == 190) {
            this.tickAbilities()
            this.resolve(new DefaultAction())
        }

        if (!(code in keyMap)) { return }
        e.preventDefault()

        window.removeEventListener("keydown", this);
        window.removeEventListener("keypress", this);
        this.tickAbilities()
        // @ts-ignore
        this.resolve(new MoveAction(this, code))
    }
}
