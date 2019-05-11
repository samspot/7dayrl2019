import Empty75x75 from '../assets/img/empty.png'
import DeathImage from '../assets/img/nemesis-death-v2.gif'

import * as _ from 'lodash';
import * as ReactDOM from "react-dom"
import '../assets/css/main.css'
import '../assets/css/sprites.css'
import '../assets/css/abilities.css'

import { Game } from './game';
import { Actor } from './actor';

import { BossSplash, render } from './markup.jsx';
import { ModalContainer } from './modal'

// TODO organize functions (check for private, etc)
export class GameDisplay {
    game: Game
    // react: ReactDOM.Renderer
    react: void
    animstack: Array<Function>
    constructor(game: Game) {
        this.react = render({ game: game })

        this.game = game
        window.gameDisplay = this
        this.animstack = []
    }

    hasAnimations() {
        return this.animstack.length > 0
    }

    addAnimation(a: Function) {
        this.animstack.push(a)
    }

    processAnimations() {
        let nextstack: Array<Function> = []

        this.animstack.forEach(a => {
            let result = a()
            if (result) {
                nextstack.push(result)
            }
        })

        this.animstack = nextstack
    }

    // called when starting a new game
    restartGui() {
        this.react = render({ game: this.game })
    }

    updateGui() {
        let renderer = <any>this.react
        renderer = <ReactDOM.Renderer>renderer
        renderer.forceUpdate()
    }

    drawBossSplash(actor: Actor) {
        if (!actor.abilities) {
            // console.log("no abilities returning")
            return
        }

        this.showModalJsx(BossSplash({ actor: actor }))
        // this.showModal(BossSplash({ actor: actor }))

        let gp = this.game.getGameProgress()
        this.renderCharacter(gp.bossNickName, 'boss-splash')
    }

    renderCharacter(className: string, id: string) {
        let elem = document.getElementById(id)
        if (elem) {

            elem.classList.forEach(c => elem.classList.remove(c))
            // elem.classList = []
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
