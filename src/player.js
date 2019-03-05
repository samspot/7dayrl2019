import { Actor } from './actor.js'
import * as ROT from 'rot-js'
import { AbilityAction, Action, MoveAction, AttackAction, PickupAction, DefaultAction, DescendAction } from './actions.js'
import { keyMap } from './keymap.js'
import { Impale, Charge } from './abilities.js';

export class Player extends Actor {
    constructor(x, y, game) {
        super(x, y, "@", "#ff0", game)

        this.name = "Tyrant"
        this.hp = 200
        // this.hp = 1
        this.str = 25

        this.addAbility(new Impale(this))
        this.addAbility(new Charge(this))
        // this.getAbilities()[0].use()
    }

    isPlayer() {
        return true
    }

    useAbility(ability) {
        this.resolve(new AbilityAction(ability))
    }

    act() {
        // console.log('Player act')
        window.addEventListener("keydown", this);
        window.addEventListener("keypress", this);
        return new Promise((resolve, reject) => {

            this.resolve = resolve
            this.reject = reject
        })
    }

    // TODO: Tank controls?
    handleEvent(e) {
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
            let action = new PickupAction(this)
            this.tickAbilities()
            this.resolve(action)
            return
        }

        if (code == 190) {
            this.tickAbilities()
            this.resolve(new DefaultAction())
        }

        if (!(code in keyMap)) { return }

        window.removeEventListener("keydown", this);
        window.removeEventListener("keypress", this);
        this.tickAbilities()
        this.resolve(new MoveAction(this, code))
    }

    checkBox() {
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
    }

}