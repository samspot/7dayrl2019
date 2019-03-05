import Tyrant from '../assets/img/tyrant.png'
import Jill from '../assets/img/jill.png'

export class GameDisplay {
    constructor(game) {
        this.game = game
    }

    updateGui() {
        this.drawStatusBar()
        this.drawAbilities()
        this.drawPortraits()
        this.drawProgress()
        this.drawMobs()
    }

    drawStatusBar(){
        let game = this.game
        document.getElementById('name').innerHTML = game.player.name
        document.getElementById('hp').innerHTML = game.player.hp
        document.getElementById('score').innerHTML = game.score
        document.getElementById('level').innerHTML = "Hunting in " + game.getGameProgress().name

        if (game.player.hp < 30) {
            document.getElementById('hp').style = "color: red"
        }
    }

    drawAbilities() {
        let game = this.game
        let elem = document.getElementById('abilities')
        elem.innerHTML = ''

        let abilities = []
        game.player.getAbilities().forEach(ability => {
            // console.log(ability)
            let { constructor, maxCooldown, cooldown, dmg, range } = ability
            if (cooldown === 0) {
                cooldown = "READY"
            }
            let text = `[Cooldown: ${cooldown}/${maxCooldown} `
                + `Damage: ${dmg} Range: ${range}]`
            abilities.push({ name: constructor.name, text: text, obj: ability })
        })

        let idx = 0
        abilities.forEach(a => {
            let button = document.createElement('button')
            button.id = "ability" + idx
            button.innerHTML = a.name
            button.style = "width: 80px; margin: 2px"
            button.onclick = a.obj.use

            let li = document.createElement('li')
            let span = document.createElement('span')
            span.innerHTML = a.text
            li.appendChild(button)
            li.appendChild(span)

            elem.appendChild(li)
            idx++
        })
    }

    drawPortraits() {
        let elem
        let portrait = new Image()
        portrait.src = Tyrant
        elem = document.getElementById('portrait')
        elem.innerHTML = ''
        elem.appendChild(portrait)

        let target = new Image()
        target.src = Jill
        elem = document.getElementById('target')
        elem.innerHTML = ''
        elem.appendChild(target)
    }

    drawProgress() {
        let game = this.game

        let gameProgress = game.getGameProgress()
        let key = "level" + game.currentLevel
        let elem = document.getElementById(key)
        elem.innerHTML = gameProgress.text
        elem.style = gameProgress.style
    }

    drawMobs() {
        let game = this.game
        let moblist = document.getElementById('monsters')
        if (moblist) {
            moblist.innerHTML = ''
            game.mobs.forEach(x => {
                let elem = document.createElement('li')
                elem.innerHTML = x.name
                elem.style = "color: " + x.color

                let list = document.createElement('ul')
                elem.appendChild(list)

                let hp = document.createElement('li')
                hp.innerHTML = x.hp
                list.appendChild(hp)


                moblist.appendChild(elem)
            })
        }

    }



}