import Tyrant from 'assets/tyrant.json';
import * as _ from 'lodash';
import { DIRS } from 'rot-js';
import { Ability, Charge, Impale, Infect, Grab, Shotgun, Suplex, GrenadeLauncher, Poison, Haymaker, Crossbow } from './abilities';
import { abilityAction, defaultAction, descendAction, moveAction } from './allactions';
import { Actor } from './actor';
import Config from './config';
import { Game } from './game';
import { keyMap, isEscKey, abilitykeys } from './keymap';
import { Stunned } from './status';

const TARGETTING = "state_targetting"
const PLAYER_TURN = "state_playerturn"

export class Player extends Actor {
    debugCount: number
    resolve: Function
    reject: Function
    splash: boolean
    constructor(x: number, y: number, game: Game) {
        super(x, y, "@", "#ff0", game)

        this.nickname = Tyrant.nickname
        this.name = Tyrant.name
        this.hp = Tyrant.hp
        this.maxHp = this.hp
        this.str = Tyrant.str
        this.color = Tyrant.color
        this.sightRadius = Tyrant.sightRadius

        this.speed = Tyrant.speed || 100
        this.setStartingAbilities()
        this.state = PLAYER_TURN
        // make the game advance a few turns on startup
        this.debugCount = 0
        if (Config.debug) {
            this.debugCount = Config.turnsToSim
        }

    }

    setStartingAbilities() {
        // this.addAbility(new GrenadeLauncher(this))
        this.addAbility(new Impale(this))
        this.addAbility(new Charge(this))
        this.addAbility(new Infect(this))

        // this.addAbility(new Grab(this))
        // this.addAbility(new Shotgun(this))
        // this.addAbility(new Suplex(this))
        // this.addAbility(new Poison(this))
        // this.addAbility(new Crossbow(this))
        // this.addAbility(new Haymaker(this))
    }

    revive() {
        this.name = Tyrant.name
        this.nickname = Tyrant.nickname
        this.symbol = Tyrant.symbol
        this.hp = Tyrant.hp
        this.maxHp = this.hp
        this.color = Tyrant.color
        this.str = Tyrant.str
        this.speed = Tyrant.speed
        this.sightRadius = Tyrant.sightRadius
        this.boss = false
        this.abilities = []

        this.setStartingAbilities()
    }

    becomeMob(mob: Actor) {
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
        this.speed = mob.speed

        this.abilities = []

        _.clone(mob.abilities).forEach(a => {
            // console.log('adding ability', a)
            a.actor = this

            let ability = _.clone(a)
            if (ability.constructor.name === 'Grab') {
                ability.range = 3
            }

            this.addAbility(ability)
        })

        this.addAbility(new Infect(this))
    }

    isTargetMode() {
        return this.state === TARGETTING
    }

    isPlayer() {
        return true
    }
    act() {
        if (this.statuses.filter(s => s instanceof Stunned).length > 0) {
            this.tickAbilities()
            _.remove(this.statuses, s => s instanceof Stunned)
            console.log('found stunned, skipping turn', this)
            this.game.message(this.name + ' missed turn due to being Stunned', true)
            return
        }

        if (this.debugCount > 0) {
            this.debugCount--


            return new Promise(resolve => {
                this.resolve = resolve
                this.resolve(defaultAction())
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


    handleTarget(e: KeyboardEvent) {
        let charCode = e.which || e.keyCode

        // escape key
        if (isEscKey(charCode)) {
            this.game.gameDisplay.hideModal()
            this.state = PLAYER_TURN
            return
        }
        if (this.splash) {
            return;
        }

        // Enter key
        if (charCode === 13) {
            this.game.gameDisplay.hideModal()
            // console.log("enter key, do ability", this)

            if (!this.usingAbility.canTargetEmpty() && !this.game.getCharacterAt(null, this.game.cursor.x, this.game.cursor.y)) {
                console.log('no character at target loc, cancelling target')
                this.state = PLAYER_TURN
                return
            }

            this.resolve(abilityAction(this.game.player, this.usingAbility,
                this.game.cursor.x, this.game.cursor.y))
            this.usingAbility = null
            this.state = PLAYER_TURN
            return
        }

        if (!(charCode in keyMap)) { return }
        e.preventDefault()

        let cursor = this.game.cursor
        if (cursor) {

            var diff = DIRS[8][keyMap[charCode]];
            let newX = cursor.x + diff[0];
            let newY = cursor.y + diff[1];

            // TODO: also make sure path is clear, don't shoot through walls
            if (this.inRange(this.usingAbility, this, newX, newY)) {
                this.game.cursor.x = newX
                this.game.cursor.y = newY

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

    distanceToActor(actor: Actor) {
        let distance = Math.sqrt((this.x - actor.x) ** 2 + (this.y - actor.y) ** 2)
        return Math.floor(distance)
    }

    handleEvent(e: KeyboardEvent) {
        // console.log('player handle event', e)
        if (this.state === TARGETTING) {
            return this.handleTarget(e)
        }
        let charCode = e.which || e.keyCode
        let charStr = String.fromCharCode(charCode)

        if (charStr == '>') {
            console.log("descend key pressed")
            code = null
            this.tickAbilities()
            // this.descending = true
            this.resolve(descendAction(this))
            return
        }

        // escape key or enter key
        if (charCode === 27 || charCode === 13) {
            this.game.gameDisplay.hideModal()
            return
        }

        if (this.splash) {
            e.preventDefault()
            return
        }
        var code = charCode
        // enter or space
        if (code == 13 || code == 32) {
            // let action = new PickupAction(this)
            return
        }

        let result = _.findIndex(abilitykeys, x => x === code)
        if (result >= 0) {
            this.useAbility(this.abilities[result])
            return
        }

        if (code == 190) {
            console.log('. pressed')
            // if (!this.descending) {
            // TODO: all these ticks should really be in Update() method.
            this.tickAbilities()
            this.resolve(defaultAction())
            // }
        }

        if (!(code in keyMap)) { return }
        e.preventDefault()

        window.removeEventListener("keydown", this);
        window.removeEventListener("keypress", this);
        this.tickAbilities()
        this.resolve(moveAction(this, code + ''))
    }
}
