import Tyrant from '../assets/img/tyrant.png'

import Jill from '../assets/img/jill.png'
import JillDead from '../assets/img/jill-dead.png'
import JillEliminated from '../assets/img/jill-eliminated.png'

import Chris from '../assets/img/chris.png'
import ChrisDead from '../assets/img/chris-dead.png'
import ChrisEliminated from '../assets/img/chris-eliminated.png'

import Barry from '../assets/img/barry.png'
import BarryDead from '../assets/img/barry-dead.png'
import BarryEliminated from '../assets/img/barry-eliminated.png'

import Brad from '../assets/img/brad.png'
import BradDead from '../assets/img/brad-dead.png'
import BradEliminated from '../assets/img/brad-eliminated.png'

import Wesker from '../assets/img/wesker.png'
import WeskerDead from '../assets/img/wesker-dead.png'
import WeskerEliminated from '../assets/img/wesker-eliminated.png'

import Unknown from '../assets/img/unknown.png'

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

            let hotkeySpan = document.createElement('span')
            hotkeySpan.innerHTML = ['Q', 'E', 'R'][idx] 
            li.appendChild(hotkeySpan)
            li.appendChild(button)
            li.appendChild(span)

            elem.appendChild(li)
            idx++
        })
    }


    renderPortrait(img){
        let elem = document.getElementById('portrait')
        elem.innerHTML = ''
        elem.appendChild(img)
    }

    renderTarget(img){
        let elem = document.getElementById('target')
        elem.innerHTML = ''
        elem.appendChild(img)
    }

    drawPortraits() {
        let playerImageMap = {
            "Tyrant": Tyrant,
            "Jill Valentine": JillDead,
            "Chris Redfield": ChrisDead,
            "Barry Burton": BarryDead,
            "Brad Vickers": BradDead,
            "Albert Wesker": WeskerDead
        }

        let targetImageMap = {
            "Jill Valentine": Jill,
            "Chris Redfield": Chris,
            "Barry Burton": Barry,
            "Brad Vickers": Brad,
            "Albert Wesker": Wesker
        }

        let deadImageMap = {
            "Jill Valentine": JillEliminated,
            "Chris Redfield": ChrisEliminated,
            "Barry Burton": BarryEliminated,
            "Brad Vickers": BradEliminated,
            "Albert Wesker": WeskerEliminated
        }

        let game = this.game

        let portraitImageFile = playerImageMap[game.player.name] || Unknown
        let portraitImage = new Image()
        portraitImage.src = portraitImageFile

        let targetImageFile = targetImageMap[game.getGameProgress().boss] || Unknown
        let targetImage = new Image()
        targetImage.src = targetImageFile

        let deadTargetImageFile = deadImageMap[game.getGameProgress().boss] || Unknown
        let deadTargetImage = new Image()
        deadTargetImage.src = deadTargetImageFile 

        this.renderPortrait(portraitImage)

        if(game.levelBossPassed()){
            this.renderTarget(deadTargetImage)
        } else {
            this.renderTarget(targetImage)
        }
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