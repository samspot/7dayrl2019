import Empty75x75 from '../assets/img/empty.png'
import Empty70x80 from '../assets/img/empty70x80.png'

import * as ReactDOM from "react-dom"
import '../assets/css/main.css'
import '../assets/css/sprites.css'
import '../assets/css/abilities.css'
import Config from './config';
import { Monster } from './monster';

import * as ROT from 'rot-js'
import { Game } from './game';
import { Actor } from './actor';
import { Ability } from './abilities';

import { BossSplash, render } from './markup.jsx';
import { ModalContainer } from './modal'

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

// TODO organize functions (check for private, etc)
export class GameDisplay {
    game: Game
    react: ReactDOM.Renderer
    constructor(game: Game) {
        // @ts-ignore
        this.react = render({ game: game })

        this.game = game
        this.renderEmptyImage(TARGET, Empty75x75)
        this.renderEmptyImage(PORTRAIT, Empty75x75)
        this.renderEmptyImage(CONDITION, Empty70x80)
        // @ts-ignore
        window.gameDisplay = this

    }

    updateGui() {
        // cleanup all tooltips
        document.querySelectorAll('.tooltiptext').forEach(e => e.parentNode.removeChild(e))
        this.drawAbilities()
        this.drawPortraits()
        this.drawProgress()
        this.drawMobs()
        this.drawMessages()
        // @ts-ignore
        this.react.forceUpdate()
    }

    getNameMap() {
        return nameMap
    }

    drawBossSplash(actor: Actor) {
        if (!actor.abilities) {
            // console.log("no abilities returning")
            return
        }

        this.showModalJsx(BossSplash({ actor: actor }))
        // this.showModalJsx2(bossSplash(actor))

        let gp = this.game.getGameProgress()
        // @ts-ignore
        let bossName = this.getNameMap()[gp.boss]
        this.renderCharacter(bossName, 'boss-splash')
    }

    drawAbilities() {
        let game = this.game

        let abilities: Array<Ability> = []
        game.player.getAbilities().forEach(ability => {
            let { constructor, maxCooldown, cooldown, dmg, range } = ability

            // let tooltip = `<b>${constructor.name}</b> cooldown is ${cooldown} (Max ${maxCooldown}) Does ${dmg} damage and has a range of ${range}.`
            let tooltip = `<p><b>${ability.constructor.name}</b></p> Damage ${ability.dmg} <br>Range ${ability.range} Cooldown ${ability.maxCooldown}`
            if (ability.description) {
                tooltip += `<p>${ability.description}</p>`
            }
            let text = ''
            // @ts-ignore
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

    renderEmptyImage(id: string, img: ImageData) {
        let elem = document.getElementById(id)
        elem.innerHTML = ''

        let empty = new Image()
        // @ts-ignore
        empty.src = img
        elem.appendChild(empty)
    }

    // this.renderCharacter(bossName, 'boss-splash')
    renderCharacter(className: string, id: string) {
        let elem = document.getElementById(id)
        if (elem) {
            // @ts-ignore
            elem.classList = []
            elem.classList.add(className)
        } else {
            console.log('couldnt find elem', className)
        }
    }

    renderAbilityImage(parent: Element, hotkey: string, ability: Ability, idx: number) {
        // @ts-ignore
        let name = ability.name.toLowerCase()
        // @ts-ignore
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
        // @ts-ignore
        center.innerHTML = ability.obj.cooldown

        let abilityImage = new Image()
        abilityImage.src = Empty75x75
        // class name for determining icon
        abilityImage.classList.add(name)
        abilityImage.classList.add('ability-icon')
        // abilityImage.onclick = function(){ alert('hai')}
        // @ts-ignore
        abilityImage.onclick = ability.obj.use

        container.appendChild(bottomLeft)
        container.appendChild(abilityImage)
        container.appendChild(center)

        // @ts-ignore
        this.addTooltip(container, ability.tooltip)

        // @ts-ignore
        if (ability.obj.cooldown === 0) {
            // @ts-ignore
            center.style = "display:none"
        }

        let superContainer = document.createElement('div')
        superContainer.classList.add('ability-super-container')
        superContainer.appendChild(container)

        // hardcode fix for launcher
        // @ts-ignore
        if (ability.name === "GrenadeLauncher") {
            // @ts-ignore
            ability.displayName = "Launcher"
        }

        let span = document.createElement('span')
        span.classList.add('ability-name')
        // @ts-ignore
        span.innerHTML = ability.displayName || ability.name
        superContainer.appendChild(span)

        parent.appendChild(superContainer)
    }

    renderTarget(name: string, boss: Actor) {
        this.renderCharacter(name, TARGET)
        let elem = document.getElementById(TARGET)

        if (boss && boss.playerSeen()) {
            this.addTooltip(elem, this.getTooltip(boss))
        }
    }

    addTooltip(elem: Element, text: string) {
        if (!elem) { return }
        elem.classList.add('tooltip')

        let tooltip = document.createElement('span')
        tooltip.classList.add('tooltiptext')
        tooltip.innerHTML = text
        elem.appendChild(tooltip)
    }

    getTooltip(actor: Actor) {
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



        // @ts-ignore
        let charName = nameMap[game.player.name] + '-dead'
        // console.log('char', charName)
        this.renderCharacter(charName, PORTRAIT)
        let elem = document.getElementById(PORTRAIT)
        this.addTooltip(elem, this.getTooltip(game.player))

        // @ts-ignore
        let bossName = nameMap[game.getGameProgress().boss]
        let boss = this.game.director.boss
        if (boss && boss.playerSeen()) {

        } else {
            bossName = 'unknown'
        }

        // console.log('bossName', bossName)
        if (game.levelBossPassed()) {
            bossName += '-eliminated'
            // @ts-ignore
            this.renderTarget(bossName)
        } else {
            this.renderTarget(bossName, boss)
        }
    }

    drawProgress2() {
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
        // @ts-ignore
        elem.style = gameProgress.style

    }

    drawProgress() {
        let game = this.game
        let currentLevelGp = game.getGameProgress()
        Object.keys(game.gameProgress).forEach(key => {
            let isCurrentLevel = currentLevelGp.level === game.gameProgress[key].level

            if (isCurrentLevel) {
                // console.log(`key ${key} iteration level ${game.gameProgress[key].level} player on level ${currentLevelGp.level} ${currentLevelGp.toString()}`)
            }

            if (currentLevelGp.level > game.gameProgress[key].level && game.gameProgress[key].text == 'Status Unknown') {
                game.gameProgress[key].style = "color: red; text-decoration: line-through"
            }

            let boss = this.game.director.boss
            if (boss && isCurrentLevel) {
                // game.gameProgress[key].text = boss.name
                if (boss.playerSeen()) {
                    game.gameProgress[key].text = boss.name
                } else {
                    game.gameProgress[key].text = "Status Unknown"
                }
            }

            let id = "level" + game.gameProgress[key].level
            let elem = document.getElementById(id)
            elem.innerHTML = game.gameProgress[key].text
            // @ts-ignore
            elem.style = game.gameProgress[key].style

            // console.log(game.gameProgress[key])

        })
        // console.log(`gp ${game.getGameProgress().toString()} boss ${bossName} key ${key}`)
    }

    drawMobs(onlyInfectable?: boolean) {
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

                if (x.hp <= game.player.getInfectStr()) {
                    name = x.name + " (infectable)"
                }

                let debugText = ''
                if (Config.debug) {
                    debugText = ' ' + x.hp + ':' + x.maxHp
                }
                elem.innerHTML = name + debugText
                // @ts-ignore
                elem.style = "color: " + x.color



                moblist.appendChild(elem)
            })
        }

    }

    drawMessages() {
        let messages = this.game.messages

        let elem = document.getElementById('msg')
        elem.innerHTML = ''

        if (messages[0]) {
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

    }

    showModal(text: string, elem?: Element) {
        if (elem) {
            document.getElementById('modal-text').innerHTML = ''
            document.getElementById('modal-text').appendChild(elem)
        } else {
            document.getElementById('modal-text').innerHTML = text
        }
        // document.getElementById('myBtn').onclick()
        var modal = document.getElementById('myModal')
        modal.style.display = 'block'
        this.game.player.splash = true
    }

    showModalJsx(elem: JSX.Element) {
        ReactDOM.render(elem, document.getElementById('modal-text'))
        var modal = document.getElementById('myModal')
        modal.style.display = 'block'
        this.game.player.splash = true
    }

    showModalJsx2(elem: JSX.Element) {
        let modal = new ModalContainer()
        modal.render()
    }

    hideModal() {
        // console.log('HIDE MODAL')
        var modal = document.getElementById('myModal')
        modal.style.display = 'none'
        this.game.player.splash = false
    }
}