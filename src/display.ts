import Empty75x75 from '../assets/img/empty.png'
import DeathImage from '../assets/img/nemesis-death-v2.gif'

import * as ReactDOM from "react-dom"
import '../assets/css/main.css'
import '../assets/css/sprites.css'
import '../assets/css/abilities.css'

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

    restartGui() {
        // @ts-ignore
        this.react = render({ game: this.game })
    }

    updateGui() {
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
        let bossName = nameMap[gp.text]
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
        ReactDOM.unmountComponentAtNode(document.getElementById('modal-text'))
        var modal = document.getElementById('myModal')
        document.getElementById('modal-text').innerHTML = ''
        let deathimage = new Image()
        deathimage.src = Empty75x75
        document.getElementById('modal-text').appendChild(deathimage)
        modal.style.display = 'none'
        this.game.player.splash = false
    }
}
