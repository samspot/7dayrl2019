import { hasLocalStorage } from './score'
import * as _ from 'lodash'

import Chimera from 'assets/chimera.json';
import Dog from 'assets/dog.json';
import Hunter from 'assets/hunter.json';
import Shark from 'assets/shark.json';
import Spider from 'assets/spider.json';
import Zombie from 'assets/zombie.json';
import Barry from 'assets/barry.json';
import Brad from 'assets/brad.json';
import Chris from 'assets/chris.json';
import Jill from 'assets/jill.json';
import Wesker from 'assets/wesker.json';
import Leon from 'assets/leon.json'
import Claire from 'assets/claire.json'
import Ada from 'assets/ada.json'
import Rebecca from 'assets/rebecca.json'
import Birkin from 'assets/birkin.json'
import Hunk from 'assets/hunk.json'
import Krauser from 'assets/krauser.json'
import Billy from 'assets/billy.json'
import Lisa from 'assets/lisa.json'
import Tyrant from 'assets/tyrant.json'

import Empty75x75 from '../assets/img/empty.png'
import { MobSpec } from './MobSpec';
import { Actor } from './actor';
import { Player } from './player';
import { Game } from './game';
import { Monster } from './monster';

let mobspecLookup: { [key: string]: MobSpec } = {
    'chimera': Chimera,
    'zombie': Zombie,
    'dog': Dog,
    'hunter': Hunter,
    'shark': Shark,
    'spider': Spider,
    'barry': Barry,
    'brad': Brad,
    'chris': Chris,
    'jill': Jill,
    'wesker': Wesker,
    'leon': Leon,
    'claire': Claire,
    'ada': Ada,
    'rebecca': Rebecca,
    'birkin': Birkin,
    'hunk': Hunk,
    'krauser': Krauser,
    'billy': Billy,
    'lisa': Lisa,
    'tyrant': Tyrant
}

interface IScore {
    score: number
    won: boolean
}

interface ICharacterScore {
    name: string
    scores: IScore[]
}

interface ICharacterCollection {
    [key: string]: ICharacterScore
}

export function getCharacters() {
    let characters: ICharacterCollection = {}
    if (hasLocalStorage()) {
        characters = JSON.parse(localStorage.getItem("characters"))
        if (!_.isObject(characters)) { characters = {} }
    }

    if (!characters.tyrant) {
        characters.tyrant = {
            name: 'tyrant',
            scores: []
        }
    }

    Object.keys(characters).forEach(c => {
        characters[c].scores.sort((a, b) => b.score - a.score)
    })

    return characters
}

export function unlockCharacter(c: Actor) {
    if (hasLocalStorage()) {
        let characters = getCharacters()

        if (!characters[c.nickname]) {
            characters[c.nickname] = {
                name: c.nickname,
                scores: []
            }
        }

        localStorage.setItem("characters", JSON.stringify(characters))
    }
}

export function characterWin(name: string, score: number, won: boolean) {
    console.log('game win with ', name, score)
    let characters = getCharacters()
    let character = characters[name] || {
        name: name,
        scores: []
    }

    character.scores.push({
        score: score,
        won: won
    })

    localStorage.setItem("characters", JSON.stringify(characters))
}

export function playCharacter(name: string) {
    let possessFn = function (player: Player, game: Game) {
        let monster = game.createBeingMonster(Monster, [player.x + ',' + player.y], mobspecLookup[name])
        game.director.generateAbilities(monster)
        player.becomeMob(monster)
        player.startingName = name
    }

    window.mainLoop(possessFn)
}

export function renderCharacters() {
    let ol = document.createElement('ol')
    ol.classList.add('charselect')
    let characters = getCharacters()
    console.log('characters', characters)
    let keys = Object.keys(characters).sort()
    while (keys.length < Object.keys(mobspecLookup).length) {
        keys.push('unknown')
    }

    keys.forEach(c => {
        let thing = characters[c] || {
            name: 'unknown',
            scores: []
        }

        let li = document.createElement('li')

        if (thing.name !== 'unknown') {
            li.onclick = function () { playCharacter(thing.name) }
        }

        let score = document.createElement('span')

        let points = thing.scores[0] && thing.scores[0].score
        let won = points > 0 && thing.scores[0].won

        let displayScore = thing.name
        if (points) {
            displayScore += '<br/> ' + points
        }

        if (won) {
            displayScore += '<br/> Won!'
        }

        score.innerHTML = displayScore
        score.classList.add('character-score')
        if (thing.scores[0] && thing.scores[0].won) {
            score.classList.add('character-score-won')
        }

        let img = new Image()
        img.classList.add('portrait')
        img.classList.add(`${thing.name}-dead`)
        img.src = Empty75x75

        li.appendChild(img)
        li.appendChild(score)

        ol.appendChild(li)



    })

    let elem = document.getElementById('charselect')
    elem.innerHTML = ''
    elem.appendChild(ol)
}