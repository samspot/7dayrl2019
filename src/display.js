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

import Empty from '../assets/img/empty.png'
import AbilitiesCooldown from '../assets/img/ability-sprite-sheet-gray.png'
import AbilitiesReady from '../assets/img/ability-sprite-sheet-color.png'

import ConditionFine from '../assets/img/condition-fine.png'

// import TopBorder from '../assets/img/top-border.png'

import '../assets/css/main.css'
import Config from './config';
import { Monster } from './monster';

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
        this.drawMessages()
    }

    drawStatusBar() {
        // let borderImage = new Image()
        // borderImage.src = Empty
        // borderImage.style = "width: 720px, height: 50px"
        // document.getElementById('top-border').appendChild(borderImage)


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
        // let elem = document.getElementById('abilities')
        // elem.innerHTML = ''

        let abilities = []
        game.player.getAbilities().forEach(ability => {
            // console.log(ability)
            let { constructor, maxCooldown, cooldown, dmg, range } = ability
            // if (cooldown === 0) {
                // cooldown = "READY"
            // }
            // let text = `[Cooldown: ${cooldown}/${maxCooldown} `
                // + `Damage: ${dmg} Range: ${range}]`
                let text = ''
            abilities.push({ name: constructor.name, text: text, obj: ability })
        })

        let parent = document.getElementById('ability-icons')
        parent.innerHTML = ''

        // TODO remove
        // TODO Ughhhh
        // let a = _.clone(abilities[0])
        // a.name = "GrenadeLauncher"
        // a.displayName = "Grenade Launcher"
        // abilities.push(a)

        let idx = 0
        // let abilities = this.game.player.getAbilities()
        abilities.forEach(a => {
            this.renderAbilityImage(parent, ['Q', 'E', 'R'][idx], a, idx)


            /*
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
            */
            idx++
        })


        // this.renderAbilityImage(parent, "Q", abilities[0], 0)
        // this.renderAbilityImage(parent, "W", abilities[1], 1)
        // this.renderAbilityImage(parent, "E", abilities[1], 2)
    }

    renderAbilityImage(parent, hotkey, ability, idx){
        // console.log('ability', ability)
        let name = ability.name.toLowerCase()
        if(ability.obj.cooldown === 0){
            name += '-ready'
        } else {
            name += '-cooldown'
        }

        let container = document.createElement('div')
        container.classList.add('container'+idx)

        let bottomLeft = document.createElement('div')
        bottomLeft.classList.add('bottom-left'+idx)
        bottomLeft.innerHTML = hotkey 

        let center = document.createElement('div')
        center.classList.add('center'+idx)
        center.innerHTML = ability.obj.cooldown

        let abilityImage = new Image()
        abilityImage.src = Empty 
        // class name for determining icon
        abilityImage.classList.add(name)
        abilityImage.classList.add('ability-icon')
        // abilityImage.onclick = function(){ alert('hai')}
        abilityImage.onclick = ability.obj.use

        container.appendChild(bottomLeft)
        container.appendChild(abilityImage)
        container.appendChild(center)

        if(ability.obj.cooldown === 0){
            center.style = "display:none"
        }

        let superContainer = document.createElement('div')
        superContainer.classList.add('ability-super-container')
        superContainer.appendChild(container)

        // hardcode fix for launcher
        if(ability.name === "GrenadeLauncher"){
            ability.displayName = "Launcher"
        }

        let span = document.createElement('span')
        span.classList.add('ability-name')
        span.innerHTML = ability.displayName || ability.name
        superContainer.appendChild(span)

        parent.appendChild(superContainer)
    }

    renderCondition(img){
        let elem = document.getElementById('condition')
        elem.innerHTML = ''
        elem.appendChild(img)
    }

    renderPortrait(img) {
        let elem = document.getElementById('portrait2')
        elem.innerHTML = ''
        elem.appendChild(img)
    }

    renderTarget(img) {
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

        let boss = this.game.director.boss
        if(boss && boss.playerSeen()){
            targetImage.src = targetImageFile
        } else {
            targetImage.src = Unknown
        }

        let deadTargetImageFile = deadImageMap[game.getGameProgress().boss] || Unknown
        let deadTargetImage = new Image()
        deadTargetImage.src = deadTargetImageFile

        this.renderPortrait(portraitImage)

        let conditionImage = new Image()
        conditionImage.src = ConditionFine
        this.renderCondition(conditionImage)

        if (game.levelBossPassed()) {
            this.renderTarget(deadTargetImage)
        } else {
            this.renderTarget(targetImage)
        }
    }

    drawProgress() {
        let game = this.game
        let gameProgress = game.getGameProgress()
        let text = "Status Unknown"
        let boss = this.game.director.boss
        if(boss && boss.playerSeen()){
            text = gameProgress.text
        }


        let key = "level" + game.currentLevel
        let elem = document.getElementById(key)
        elem.innerHTML = text
        elem.style = gameProgress.style
    }

    drawMobs(onlyInfectable) {
        let game = this.game
        let moblist = document.getElementById('monsters')
        if (moblist) {
            moblist.innerHTML = ''

            let mobs = []
            if(onlyInfectable){
                // console.log('all infectable')
                mobs = game.getInfectableMobs()
            } else {
                // console.log('all visible')
                mobs = game.getVisibleMobs()
                // mobs = game.getInfectableMobs()
            }

            mobs.forEach(x => {
                // if(onlyInfectable){
                    // console.log('render mob list', x )
                // }
                let elem = document.createElement('li')

                let name = x.name
                if(x.isInjured()){
                    name += " (injured)"
                }

                let debugText = ''
                if(Config.debug){
                    debugText = ' ' + x.hp + ':' + x.maxHp
                }
                elem.innerHTML = name + debugText
                elem.style = "color: " + x.color

                /*
                let list = document.createElement('ul')
                elem.appendChild(list)

                let hp = document.createElement('li')
                hp.innerHTML = x.hp
                list.appendChild(hp)
                */


                moblist.appendChild(elem)
                // force redraw - not working
                // moblist.style.display = 'none'
                // moblist.style.display = 'block'
            })
        }

    }

    drawMessages() {
        let messages = this.game.messages

        let elem = document.getElementById('msg')
        elem.innerHTML = ''

        if (messages[0]) {
            // let recentTurn = messages[0].turn
            let recentTurn = this.game.turns
            for (let i = 0; i < Config.messageListSize; i++) {
                let message = messages[i]
                if (message) {
                    let span = document.createElement('span')

                    let source = message.source
                    let target = message.target


                    let text = message.msg
                    if(source || target){
                        text = `${target} receives ${message.msg} [Source: ${source}]`
                    }

                    span.innerHTML = text + '<br>'
                    if (message.turn !== recentTurn) {
                        span.classList.add('old-message')
                    } 
                    if(message.important){
                        // TODO switch to old mesage after its passed, probably by changing to else-if
                        span.classList.add('important-message')
                    }


                    let actorSource = message.actorSource
                    // console.log('message debug source', source, 'instance of monster', source instanceof Monster, message)
                    if(actorSource instanceof Monster && !actorSource.playerSeen()){
                        // console.log("suppressing message", span.innerHTML)
                        continue;
                    }

                    elem.appendChild(span)
                }
            }
        }
        /*
        console.log('printing msg', msg)
        elem.classList.remove('fade-in')
        elem.classList.add('fade-in')
        span.innerHTML = msg + '<br>'
        elem.appendChild(span)
        */
    }
}