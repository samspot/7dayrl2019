import * as ROT from 'rot-js'
import { keyMap } from './keymap.js'

export class Action {
    constructor(actor) {
        this.actor = actor
    }

    executeParent(game) {
        // console.log('executing', this)
    }
}

export class AttackAction extends Action {
    constructor(actor, target) {
        super(actor)
        this.target = target
    }

    execute(game){

        // alert('attack ' + this.actor.out() + ' against ' + this.target.out())
        // console.log('attack ' + this.actor.out() + ' against ' + this.target.out())
        // console.log(game.mobs)
        this.target.hp -= this.actor.str
        if(this.target.hp <= 0){
            if(!this.target.isPlayer()){
                _.remove(game.mobs, this.target)
                game.scheduler.remove(this.target)
            }

            // console.log("target", this.target)
            if(this.target.isBoss()){
                // return new YouWinAction()
            }

            this.target.draw('.', 'red')
        }

        if(game.player.hp <= 0){
            // return new GameOverAction()
            
            let mob
            let player = game.player
            while(!mob){
                let idx = prompt("Choose a new body (enter number)")
                // if(idx < 0){ idx = 0 }
                // if(idx > game.mobs.length){ idx = game.mobs.length-1}
                if(parseInt(idx, 10))

                mob = game.mobs[idx-1]
                // console.log(game.mobs)
                // console.log(mob)
                if(!mob){ continue }

                _.remove(game.mobs, mob)
                game.scheduler.remove(mob)
            }
            player.name = mob.name
            player.hp = mob.hp
            // player.hp = 50
            player._color = mob._color
            player.str = mob.str
            player._x = mob._x
            player._y = mob._y
            player.boss = false
            player.draw()
            // console.log("after attack player", player)
            
        }
    }
}

export class MoveAction extends Action {
    constructor(actor, direction, newX, newY) {
        super(actor)
        this.direction = direction
        this.newX = newX
        this.newY = newY
    }

    execute(game){
        this.executeParent(game)
        let actor = this.actor

        let newX, newY
        if(this.newX && this.newY){
            newX = this.newX
            newY = this.newY
        }

        if(actor.isPlayer()){
            var diff = ROT.DIRS[8][keyMap[this.direction]];
            newX = actor._x + diff[0];
            newY = actor._y + diff[1];

            // is the space in the map at all?
            var newKey = newX + "," + newY;
            if (!(newKey in game.map)) { return }
        }

        // collision here
        let character = game.getCharacterAt(actor, newX, newY)
        if(character){
            return new AttackAction(actor, character)
        }

        game.display.draw(actor._x, actor._y, game.map[actor._x + "," + actor._y])
        actor._x = newX;
        actor._y = newY;
        actor.draw();
    }
}

export class PickupAction extends Action {
    constructor(actor) {
        super(actor)
    }

    execute(game) {
        // console.log("execute pickup action")
        this.executeParent(game)
        this.actor.checkBox()
    }
}

export class DefaultAction extends Action {
    constructor(actor) {
        super(actor)
    }

    execute(game){
        return
    }
}

export class GameOverAction extends Action {
    constructor(actor){
        super(actor)
    }

    execute(game){
        game.gameOver = true
        alert("You were killed!  Game Over!")
    }
}

export class YouWinAction extends Action {
    constructor(actor){
        super(actor)
    }

    execute(game){
        game.gameOver = true
        alert("You killed the boss! You Win!")
    }
}
