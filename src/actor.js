
import * as ROT from 'rot-js'
import Tyrant from 'assets/tyrant.json'
import Zombie from 'assets/zombie.json'
import Jill from 'assets/jill.json'
import { YouWinAction } from './actions';

export class Actor {
    constructor(x, y, symbol, color, game) {
        this.x = x
        this.y = y
        this.symbol = symbol
        this.color = color
        this.game = game
        // this.draw()
        this.boss = false
        this.abilities = []

        // console.log("Tyrant", Tyrant.hp, "Zombie", Zombie.hp, "Jill", Jill.hp)
    }

    damage(dmg){
        this.hp -= dmg
        if(this.hp <=0 && !this.isPlayer()){
            // TODO below if is repeated, but we need to add player logic here from actions.js
            if(!this.isPlayer()){
                this.game.destroyMob(this)
            }

            if(this.isBoss()){
                this.game.killBoss()

                if(this.game.allBossesDown()){
                    return new YouWinAction()
                }
            }
        }
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

    draw(symbol, color, bgColor) {
        let symbolToDraw = this.symbol
        let colorToDraw = this.color
        if(symbol){
            symbolToDraw = symbol
            colorToDraw = color
        }
        this.game.display.draw(this.x, this.y, 
            symbolToDraw, colorToDraw, bgColor)
        // console.log(this.name, this.hp)
    }

    drawMe(bgColor){
        this.draw(this.symbol, this.color, bgColor)
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
