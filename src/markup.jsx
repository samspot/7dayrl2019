import Empty75x75 from '../assets/img/empty.png'
import * as  React from "react"
import * as ReactDOM from "react-dom"

import { GameProgress } from './Level';
import { Monster } from './monster';
import Config from './config';
import { StatusBar } from './statusbar'

export const render = (props) => {
    return ReactDOM.render(
        <GameComponent game={props.game} />,
        document.getElementById("gamediv")
    );
}


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
                <Messages game={this.state.game} />
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

const MonsterList = (props) => {
    let items = props.game && props.game.getDisplayMobs().map((m, idx) =>
        <Monster
            name={m.name}
            color={m.color}
            infectable={m.hp <= props.game.player.getInfectStr()}
            debug={Config.debug ? ' ' + m.hp + ':' + m.maxHp : ''}
            key={idx}
        />
    )
    return (
        <div id="monster-container">
            <h3>Monsters</h3>
            <ol id="monsters">
                {items}
            </ol>
        </div>
    )
}

const Monster = (props) =>
    <li style={{ color: props.color }}>
        {props.name}
        {props.infectable ? ' (infectable)' : ''}
        {props.debug}
    </li>

const Messages = (props) => {
    let list = props.game && props.game.messages.map((m, idx) => {
        m.idx = idx

        let message = _.clone(m)
        message.idx = idx

        let source = message.source
        let target = message.target

        let text = message.msg
        if (source || target) {
            text = `${target} receives ${message.msg} [Source: ${source}]`
        }
        message.msg = text
        message.recent = message.turn >= props.game.turns

        return message
    }).map(m => <Message text={m.msg} key={m.idx} recent={m.recent} important={m.important} />)

    return (
        <div style={{ clear: 'both' }}>
            <p id="msg">
                {list}
            </p>
        </div>
    )
}

const Message = (props) =>
    <span className={(props.recent ? '' : 'old-message') + ' ' + (props.important ? 'important-message' : '')}>
        {props.text} <br />
    </span>

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
// const AbilityList = (props: { [key: string]: Array<Ability> }) => {
const AbilityList = (props) => {
    const listItems = props.abilities.map((a, idx) => <AbilityComponent value={a} key={idx} />)
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