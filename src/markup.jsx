import Empty75x75 from '../assets/img/empty.png'
import * as  React from "react"
import * as ReactDOM from "react-dom"
import { Ability } from './abilities';
import { Actor } from './actor';

import { nameMap } from './namemap'
import { GameProgress } from './Level';
import { Monster } from './monster';

export const render = (props) => {
    return ReactDOM.render(
        <GameComponent game={props.game} />,
        document.getElementById("gamediv")
    );
}


// export const GameComponent = (props: any) =>
class GameComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            game: props.game,
        }

    }
    render() {
        return (
            <div id="game" className="game">
                <h2 id="title">KILL S.T.A.R.S</h2>
                <StatusBar
                    player={this.state.game.player}
                    game={this.state.game}
                />
                <Level game={this.state.game} />
                <MainContainer game={this.state.game} />
                <Messages />
            </div>
        )
    }
}


// const StatusBar = (props: any) => {
class StatusBar extends React.Component {
    render() {

        let name = this.props.player && this.props.player.name
        name = nameMap[name]

        let hp = this.props.player && this.props.player.hp

        let gp = this.props.game.getGameProgress()
        let director = this.props.game.director

        let bossName = gp && nameMap[gp.boss]
        let boss = director && director.boss

        if (boss && boss.playerSeen()) {
            if (this.props.game.levelBossPassed()) {
                bossName += '-eliminated'
            }
        } else {
            bossName = 'unknown'
        }

        let maxHp = this.props.player && this.props.player.maxHp

        return (
            <div id="status-bar">
                <Portrait name={name + '-dead'} id="portrait2" />
                <Condition hp={hp} maxHp={maxHp} />
                <Portrait name={bossName} id="target" />
                <div id="ability-icons"></div>
                <span id="name"> {name} </span>
                <span id="hp">{hp}</span>
                <span id="score">{this.props.game.score}</span>
            </div>
        )
    }
}

class Condition extends React.Component {
    render() {
        let conditionName
        let hp = this.props.hp
        let maxHp = this.props.maxHp
        if (hp < maxHp * .5) {
            conditionName = 'condition-danger'
        } else if (hp < maxHp * .8) {
            conditionName = 'condition-caution'
        } else {
            conditionName = 'condition-fine'
        }

        return (
            <div id="condition" className={conditionName}></div>
        )
    }
}

class Portrait extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div id={this.props.id} className={this.props.name}>
                <img src={Empty75x75} />
            </div>
        )
    }
}

const Level = (props) => {
    let name = props.game.getGameProgress() ? props.game.getGameProgress().name : ''
    return (

        <span id="level">Hunting in {name}</span>
    )
}

const MainContainer = (props) =>
    <div className="main-container">
        <div style={{ float: 'left' }}>
            <div style={{ float: 'left' }} id="mapContainer"></div>
        </div>
        <div id="right-bar">
            <MonsterList game={props.game} />
            <GameProgress game={props.game} />
        </div>
    </div>

const GameProgress = (props) =>
    <div id="progress-container">
        <h3>Game Progress</h3>
        <ul id="progress">
            <GameProgressLevel id="level0" gameProgress={props.game.gameProgress.level0} />
            <GameProgressLevel id="level1" gameProgress={props.game.gameProgress.level1} />
            <GameProgressLevel id="level2" gameProgress={props.game.gameProgress.level2} />
            <GameProgressLevel id="level3" gameProgress={props.game.gameProgress.level3} />
            <GameProgressLevel id="level4" gameProgress={props.game.gameProgress.level4} />
        </ul>
    </div>

const GameProgressLevel = (props) => {
    let text = "Status Unknown"
    let className = ''
    if (props.gameProgress.bossObj && props.gameProgress.bossObj.playerSeen()) {
        text = props.gameProgress.boss
    }

    if (props.gameProgress.bossDown) {
        className = 'gp-boss-down'
    }

    return (
        <li id={props.id}
            className={className}>
            {text}
        </li>
    )
}

const MonsterList = () =>
    <div id="monster-container">
        <h3>Monsters</h3>
        <ol id="monsters">
        </ol>
    </div>

const Messages = () =>
    <div style={{ clear: 'both' }}>
        <p id="msg"></p>
    </div>


export const BossSplash = (props) => {
    return (
        <div>
            <div style={{ float: 'left', width: '50%' }}>
                <img src={Empty75x75} id='boss-splash' />
            </div>
            <BossTraits actor={props.actor} />
            <AbilityList abilities={props.actor.abilities} />
            <BossText actor={props.actor} />
        </div>
    )
}

const BossText = (props) =>
    <div>
        <h3>Bio</h3>
        <p>{props.actor.bio}</p>
        <p>{props.actor.quote}</p>
    </div>

const BossTraits = (props) =>
    <div style={{ float: 'right', width: '50%' }}>
        <span style={{ color: 'red' }}>TARGET</span>
        <p style={{ padding: 0, margin: 0 }}>
            <b>{props.actor.name}</b>
        </p>
        <p style={{ padding: 0, margin: 0 }}>
            HP {props.actor.hp}/{props.actor.maxHp}
        </p>
        <p style={{ padding: 0, margin: 0 }}>
            Melee Damage {props.actor.str}
        </p>
    </div>

// const AbilityList = (props: { [key: string]: Array<Ability> }) => {
const AbilityList = (props) => {
    const listItems = props.abilities.map(a => <AbilityComponent value={a} key={a.constructor.name} />)
    return (
        <div style={{ clear: 'both' }}>
            <h3>Skills</h3>
            {listItems}
        </div>
    )
}

const AbilityComponent = (props) => {
    const ability = props.value

    return (
        <div style={{ height: '75px' }}>
            <img src={Empty75x75}
                style={{ float: 'right', marginTop: '-18px' }}
                className={ability.constructor.name.toLowerCase() + '-ready'} />
            <p>
                <b>{ability.constructor.name}</b> Damage {ability.dmg}
                <br />
                Range {ability.range} Cooldown {ability.maxCooldown}
            </p>
        </div >
    )
}
