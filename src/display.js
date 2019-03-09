import Empty75x75 from '../assets/img/empty.png'
import Empty70x80 from '../assets/img/empty70x80.png'

import '../assets/css/main.css'
import '../assets/css/sprites.css'
import '../assets/css/abilities.css'
import Config from './config';
import { Monster } from './monster';

import * as ROT from 'rot-js'

const TARGET = 'target'
const PORTRAIT = 'portrait2'
const CONDITION = 'condition'

const nameMap = {
    'Tyrant': 'tyrant',
    'Jill Valentine': 'jill',
    'Chris Redfield': 'chris',
    'Barry Burton': 'barry',
    'Brad Vickers': 'brad',
    'Albert Wesker': 'wesker',
    'Zombie': 'zombie',
    'Chimera': 'chimera',
    'Dog': 'dog',
    'Hunter': 'hunter',
    'Lisa Trevor': 'lisa',
    'Shark': 'shark',
    'Giant Spider': 'spider'
}

export class GameDisplay {
    constructor(game) {
        this.game = game
        this.renderEmptyImage(TARGET, Empty75x75)
        this.renderEmptyImage(PORTRAIT, Empty75x75)
        this.renderEmptyImage(CONDITION, Empty70x80)
    }

    updateGui() {
        // cleanup all tooltips
        document.querySelectorAll('.tooltiptext').forEach(e => e.parentNode.removeChild(e))
        this.drawStatusBar()
        this.drawAbilities()
        this.drawPortraits()
        this.drawProgress()
        this.drawMobs()
        this.drawMessages()
    }

    getNameMap() {
        return nameMap
    }

    drawBossSplash(actor) {
        if(!actor.abilities){
            console.log("no abilities returning")
            return
        }

        let textTraits = `<span style="color: red">TARGET</span> <b>${actor.name}</b><p> HP ${actor.hp}/${actor.maxHp}<br> Melee Damage ${actor.str}`

        let abilities = actor.abilities.map(a => {
            console.log('ability', a)
            // return `<p>${a.constructor.name} Damage ${a.dmg} Range ${a.range} Cooldown ${a.maxCooldown}`
            return a
        }).map(a => {
            let name = a.constructor.name.toLowerCase()
            // hardcode fix for launcher
            if (name === "GrenadeLauncher") {
                name = "Launcher"
            }

            let image = new Image()
            image.src = Empty75x75
            image.style = "float: right; margin-top: -18px"
            image.classList.add(name+'-ready')

            return {
                image: image,
                text: `<p><b>${a.constructor.name}</b> Damage ${a.dmg} <br>Range ${a.range} Cooldown ${a.maxCooldown}`
            }
        }).map(a => {
            let div = document.createElement('div')
            div.style = 'height: 64px'
            div.appendChild(a.image)

            let span = document.createElement('span')
            span.innerHTML = a.text
            // span.style = "float: left;"
            div.appendChild(span)
            return div
        })

        console.log(abilities)

        let text = `<h3>Bio</h3><p>${actor.bio}<p>"${actor.quote}"`

        let gp = this.game.getGameProgress()
        let targetImage = new Image()
        targetImage.src = Empty75x75
        targetImage.id = 'boss-splash'
        targetImage.style = "margin-left: 48px; margin-top: 11px;"

        // main div
        let div = document.createElement('div')

        let leftDiv = document.createElement('div')
        leftDiv.style="float: left; width: 50%"

        let rightDiv = document.createElement('div')
        rightDiv.style="float: left; width: 50%"

        let bottomDiv = document.createElement('div')
        bottomDiv.style="clear: both"

        let span = document.createElement('span')
        span.innerHTML = textTraits

        let span2 = document.createElement('span')
        span2.innerHTML = text

        leftDiv.appendChild(targetImage)
        rightDiv.appendChild(span)

        let spanSkillTitle = document.createElement('span')
        spanSkillTitle.innerHTML = '<h3>Skills</h3>'

        bottomDiv.appendChild(spanSkillTitle)
        abilities.forEach(a => bottomDiv.appendChild(a))
        bottomDiv.appendChild(span2)

        div.appendChild(leftDiv)
        div.appendChild(rightDiv)
        div.appendChild(bottomDiv)

        // div.appendChild(targetImage)

        // div.appendChild(span)

        this.game.gameDisplay.showModal(text, div)

        let display = this.game.gameDisplay
        let bossName = display.getNameMap()[gp.boss]
        display.renderCharacter(bossName, 'boss-splash')
    }

    drawStatusBar() {
        let game = this.game


        document.getElementById('name').innerHTML = nameMap[game.player.name]
        document.getElementById('hp').innerHTML = game.player.hp
        document.getElementById('score').innerHTML = "Score " + game.score
        document.getElementById('level').innerHTML = "Hunting in " + game.getGameProgress().name

        if (game.player.hp < 30) {
            document.getElementById('hp').style = "color: red"
        }
    }

    drawAbilities() {
        let game = this.game

        let abilities = []
        game.player.getAbilities().forEach(ability => {
            let { constructor, maxCooldown, cooldown, dmg, range } = ability

            let tooltip = `<b>${constructor.name}</b> cooldown is ${cooldown} (Max ${maxCooldown}) Does ${dmg} damage and has a range of ${range}.`
            let text = ''
            abilities.push({ name: constructor.name, text: text, obj: ability, tooltip: tooltip })
        })

        let parent = document.getElementById('ability-icons')
        parent.innerHTML = ''
        let idx = 0
        abilities.forEach(a => {
            this.renderAbilityImage(parent, ['Q', 'E', 'R'][idx], a, idx)
            idx++
        })
    }

    renderEmptyImage(id, img) {
        let elem = document.getElementById(id)
        elem.innerHTML = ''

        let empty = new Image()
        empty.src = img
        elem.appendChild(empty)
    }

    renderCharacter(className, id) {
        let elem = document.getElementById(id)
        if (elem) {
            elem.classList = []
            elem.classList.add(className)
        } else {
            console.log('couldnt find elem', className)
        }
    }

    renderAbilityImage(parent, hotkey, ability, idx) {
        let name = ability.name.toLowerCase()
        if (ability.obj.cooldown === 0) {
            name += '-ready'
        } else {
            name += '-cooldown'
        }

        let container = document.createElement('div')
        container.classList.add('container' + idx)

        let bottomLeft = document.createElement('div')
        bottomLeft.classList.add('bottom-left' + idx)
        bottomLeft.innerHTML = hotkey

        let center = document.createElement('div')
        center.classList.add('center' + idx)
        center.innerHTML = ability.obj.cooldown

        let abilityImage = new Image()
        abilityImage.src = Empty75x75
        // class name for determining icon
        abilityImage.classList.add(name)
        abilityImage.classList.add('ability-icon')
        // abilityImage.onclick = function(){ alert('hai')}
        abilityImage.onclick = ability.obj.use

        container.appendChild(bottomLeft)
        container.appendChild(abilityImage)
        container.appendChild(center)

        this.addTooltip(container, ability.tooltip)

        if (ability.obj.cooldown === 0) {
            center.style = "display:none"
        }

        let superContainer = document.createElement('div')
        superContainer.classList.add('ability-super-container')
        superContainer.appendChild(container)

        // hardcode fix for launcher
        if (ability.name === "GrenadeLauncher") {
            ability.displayName = "Launcher"
        }

        let span = document.createElement('span')
        span.classList.add('ability-name')
        span.innerHTML = ability.displayName || ability.name
        superContainer.appendChild(span)

        parent.appendChild(superContainer)
    }

    renderTarget(name, boss) {
        this.renderCharacter(name, TARGET)
        let elem = document.getElementById(TARGET)

        if (boss && boss.playerSeen()) {
            this.addTooltip(elem, this.getTooltip(boss))
        }
    }

    addTooltip(elem, text) {
        if (!elem) { return }
        elem.classList.add('tooltip')

        let tooltip = document.createElement('span')
        tooltip.classList.add('tooltiptext')
        tooltip.innerHTML = text
        elem.appendChild(tooltip)
    }

    getTooltip(actor) {
        return `<b>${actor.name}</b><br><br> HP ${actor.hp}/${actor.maxHp}<br> Melee Damage: ${actor.str}`
    }


    drawPortraits() {
        let game = this.game
        let conditionName
        let hp = game.player.hp
        if (hp < game.player.maxHp * .5) {
            conditionName = 'condition-danger'
        } else if (hp < game.player.maxHp * .8) {
            conditionName = 'condition-caution'
        } else {
            conditionName = 'condition-fine'
        }

        this.renderCharacter(conditionName, CONDITION)



        let charName = nameMap[game.player.name] + '-dead'
        // console.log('char', charName)
        this.renderCharacter(charName, PORTRAIT)
        let elem = document.getElementById(PORTRAIT)
        this.addTooltip(elem, this.getTooltip(game.player))

        let bossName = nameMap[game.getGameProgress().boss]
        let boss = this.game.director.boss
        if (boss && boss.playerSeen()) {

        } else {
            bossName = 'unknown'
        }

        // console.log('bossName', bossName)
        if (game.levelBossPassed()) {
            bossName += '-eliminated'
            this.renderTarget(bossName)
        } else {
            this.renderTarget(bossName, boss)
        }
    }

    drawProgress() {
        let game = this.game
        let gameProgress = game.getGameProgress()
        let text = "Status Unknown"
        let boss = this.game.director.boss
        if (boss && boss.playerSeen()) {
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
            if (onlyInfectable) {
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
                if (x.isInjured()) {
                    name += " (injured)"
                }

                let debugText = ''
                if (Config.debug) {
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
                    if (source || target) {
                        text = `${target} receives ${message.msg} [Source: ${source}]`
                    }

                    span.innerHTML = text + '<br>'
                    if (message.turn !== recentTurn) {
                        span.classList.add('old-message')
                    }
                    if (message.important) {
                        // TODO switch to old mesage after its passed, probably by changing to else-if
                        span.classList.add('important-message')
                    }


                    let actorSource = message.actorSource
                    // console.log('message debug source', source, 'instance of monster', source instanceof Monster, message)
                    if (actorSource instanceof Monster && !actorSource.playerSeen()) {
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

    showModal(text, elem) {
        if (elem) {
            document.getElementById('modal-text').innerHTML = ''
            document.getElementById('modal-text').appendChild(elem)
        } else {
            document.getElementById('modal-text').innerHTML = text
        }
        document.getElementById('myBtn').onclick()
    }

    hideModal() {
        document.getElementsByClassName("close")[0].onclick();
    }
}