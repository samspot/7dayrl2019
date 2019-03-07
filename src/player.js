import { Actor } from './actor.js'
import * as ROT from 'rot-js'
import { AbilityAction, Action, MoveAction, AttackAction, PickupAction, DefaultAction, DescendAction } from './actions.js'
import { keyMap } from './keymap.js'
import { Impale, Charge, GrenadeLauncher, Infect } from './abilities.js';
import { Cursor } from './cursor.js';
import Config from './config.js';
import Tyrant from 'assets/tyrant.json'

const TARGETTING = "state_targetting"
const PLAYER_TURN = "state_playerturn"

export class Player extends Actor {
    constructor(x, y, game) {
        super(x, y, "@", "#ff0", game)

        this.name = Tyrant.name
        this.hp = Tyrant.hp
        this.maxHp = this.hp
        this.str = Tyrant.str 
        this.color = Tyrant.color
        this.sightRadius = Tyrant.sightRadius

        this.addAbility(new Impale(this))
        this.addAbility(new Charge(this))
        this.addAbility(new Infect(this))
        // this.addAbility(new GrenadeLauncher(this))
        // this.getAbilities()[0].use()

        this.state = PLAYER_TURN
        // make the game advance a few turns on startup
        this.debugCount = 0
        if (Config.debug) {
            this.debugCount = Config.turnsToSim 
        }
    }

    revive(){
        this.name = Tyrant.name
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

    infectMob(mob){
        this.name = mob.name
        this.hp = mob.maxHp * 1.5
        if(this.hp < 150){ this.hp = 150}
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
            if(a.constructor.name === 'Impale'){ hasImpale = true}
        })
        if(!hasImpale){
            // this.addAbility(new Impale(this))
        }
        this.addAbility(new Infect(this))
    }

    isTargetMode(){
        return this.state === TARGETTING
    }

    isPlayer() {
        return true
    }

    useAbility(ability) {
        // console.log("player.useAbility()", ability)
        if (ability && ability.cooldown === 0) {
            // console.log("abilty available", ability.cooldown, ability.maxCooldown)
            this.state = TARGETTING
            this.usingAbility = ability
            this.game.cursor = new Cursor(this.x, this.y, this.game)
        }
    }

    act() {
        if (this.debugCount > 0) {
            this.debugCount--
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

    handleTarget(e) {
        // console.log("targetting")

        let charCode = e.which || e.keyCode
        let charStr = String.fromCharCode(charCode)

        // escape key
        if (charCode === 27) {
            this.state = PLAYER_TURN
            this.game.redraw()
            // this.game.dirty = true
            return
        }

        // Enter key
        if (charCode === 13) {
            console.log("enter key, do ability", this)
            // ability.cooldown = ability.maxCooldown

            if (!this.usingAbility.canTargetEmpty() && !this.game.getCharacterAt(null, this.game.cursor.x, this.game.cursor.y)) {
                console.log('no character at target loc, cancelling target')
                this.game.redraw()
                this.state = PLAYER_TURN
                return
            }

            this.resolve(new AbilityAction(this.game, this.usingAbility,
                this.game.cursor.x, this.game.cursor.y))
            this.usingAbility = null
            this.state = PLAYER_TURN
            this.game.dirty = true
            return
        }

        if (!(charCode in keyMap)) { return }
        e.preventDefault()

        let cursor = this.game.cursor

        var diff = ROT.DIRS[8][keyMap[charCode]];
        let newX = cursor.x + diff[0];
        let newY = cursor.y + diff[1];

        // TODO: also make sure path is clear, don't shoot through walls
        if (this.inRange(this.usingAbility, this, newX, newY)) {
            this.game.cursor.x = newX
            this.game.cursor.y = newY

            this.game.redraw()
            cursor.drawMe()
        }
    }

    inRange(ability, actor, x, y){
        let distance = Math.sqrt( (x - actor.x) ** 2 + (y - actor.y) ** 2)
        distance = Math.floor(distance)
        // console.log('distance', distance, 'range', ability.range)
        return distance <= ability.range
    }

    // TODO: Tank controls?
    handleEvent(e) {
        if (this.state === TARGETTING) {
            return this.handleTarget(e)
        }
        // console.log(e)
        let charCode = e.which || e.keyCode
        let charStr = String.fromCharCode(charCode)

        if (charStr == '>') {
            this.tickAbilities()
            this.resolve(new DescendAction(this))
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
            ROT.KEYS.VK_Q,
            ROT.KEYS.VK_E,
            ROT.KEYS.VK_R
        ]
        let result = _.findIndex(abilitykeys, x => x === code)
        if(result >= 0){
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
        this.resolve(new MoveAction(this, code))
    }

    checkBox() {
        /*
        var key = this.x + "," + this.y;
        if (this.game.map[key] != "*") {
            alert("There is no box here!");
            this.game.display.drawText(20, 2, "There is no box here")
        } else if (key == this.game.ananas) {
            window.removeEventListener("keydown", this);
            this.game.gameover("Hooray! You found an ananas and won the game.")
        } else {
            alert("This box is empty :-(");
        }
        */
    }

}