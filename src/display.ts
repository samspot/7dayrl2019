import Empty75x75 from '../assets/img/empty.png'
// import DeathImage from '../assets/img/nemesis-death-v2.gif'
import DeathImage from '../assets/img/nemesis-death-v2.png'

import * as ReactDOM from "react-dom"
import '../assets/css/main.css'
import '../assets/css/sprites.css'
import '../assets/css/abilities.css'
import Config from './config';
import { Monster } from './monster';

import * as ROT from 'rot-js'
import { Game } from './game';
import { Actor } from './actor';

import { BossSplash, render } from './markup.jsx';
import { ModalContainer } from './modal'

import { nameMap } from './namemap'

// TODO organize functions (check for private, etc)
export class GameDisplay {
    game: Game
    react: ReactDOM.Renderer
    constructor(game: Game) {
        // @ts-ignore
        this.react = render({ game: game })

        this.game = game
        // @ts-ignore
        window.gameDisplay = this
    }

    updateGui() {
        this.drawMobs()
        this.drawMessages()
        // @ts-ignore
        this.react.forceUpdate()
    }

    drawBossSplash(actor: Actor) {
        if (!actor.abilities) {
            // console.log("no abilities returning")
            return
        }

        this.showModalJsx(BossSplash({ actor: actor }))

        let gp = this.game.getGameProgress()
        // @ts-ignore
        let bossName = nameMap[gp.boss]
        this.renderCharacter(bossName, 'boss-splash')
    }

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

    // TODO
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
        if (text.match(/You Died/)) {
            let deathimage = new Image()
            deathimage.src = ''
            deathimage.src = DeathImage + "?x=" + Math.random()
            document.getElementById('modal-text').appendChild(deathimage)
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
        document.getElementById('modal-text').innerHTML = ''
        let deathimage = new Image()
        deathimage.src = Empty75x75
        document.getElementById('modal-text').appendChild(deathimage)
        modal.style.display = 'none'
        this.game.player.splash = false
    }
}