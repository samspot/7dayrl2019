
import * as ROT from 'rot-js'
import Tyrant from 'assets/tyrant.json'
import Zombie from 'assets/zombie.json'
import Jill from 'assets/jill.json'

export class Actor {
    constructor(x, y, symbol, color, game) {
        this.x = x
        this.y = y
        this.symbol = symbol
        this.color = color
        this.game = game
        this.draw()
        this.boss = false
        this.abilities = []

        // console.log("Tyrant", Tyrant.hp, "Zombie", Zombie.hp, "Jill", Jill.hp)
    }

    tickAbilities(){
        this.abilities.forEach(a => a.tick())
    }

    addAbility(ability){
        this.abilities.push(ability)
    }

    getAbilities(){
        return this.abilities
    }

    isPlayer() {
        return false
    }

    isBoss(){
        return this.boss
        // return true
    }

    draw(symbol, color) {
        let symbolToDraw = this.symbol
        let colorToDraw = this.color
        if(symbol){
            symbolToDraw = symbol
            colorToDraw = color
        }
        this.game.display.draw(this.x, this.y, 
            symbolToDraw, colorToDraw)
        // console.log(this.name, this.hp)
    }

    getX() {
        return this.x
    }

    getY() {
        return this.y
    }

    out(){
        return this.symbol + ' ' + this.x + ',' + this.y
    }
}
