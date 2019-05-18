import Empty75x75 from '../assets/img/empty.png'
import * as React from "react"
import * as ReactDOM from "react-dom"

import { Level } from './Level';
import Config from './config';
import { StatusBar } from './statusbar'
import { Actor } from './actor';
import { Ability } from './abilities';
import { Game } from './game';
import { IUiMessageElement } from './message';

interface IPropsGame {
    game: Game
}

interface IPropsAbility {
    ability: Ability
}

interface IPropsActor {
    actor: Actor
}

// TODO: remove 'any' types across project

export const render = (props: IPropsGame) => {
    ReactDOM.unmountComponentAtNode(document.getElementById('gamediv'))
    return ReactDOM.render(
        <GameComponent game={props.game} />,
        document.getElementById("gamediv")
    );
}


class GameComponent extends React.Component<{ game: Game }> {
    render() {
        return (
            <div id="game" className="game">
                <h2 id="title">KILL S.T.A.R.S</h2>
                <StatusBar
                    player={this.props.game.player}
                    game={this.props.game}
                />
                <LevelComponent game={this.props.game} />
                <MainContainer game={this.props.game} />
                <Messages game={this.props.game} />
            </div>
        )
    }
}

const LevelComponent = (props: IPropsGame) => {
    let name = props.game.getGameProgress() ? props.game.getGameProgress().name : ''
    return (

        <span id="level">Hunting in {name}</span>
    )
}

const MainContainer = (props: IPropsGame) =>
    <div className="main-container">
        <div style={{ float: 'left' }}>
            <div style={{ float: 'left' }} id="mapContainer"></div>
        </div>
        <div id="right-bar">
            <MonsterList game={props.game} />
            <GameProgressComponent game={props.game} />
        </div>
    </div>

const GameProgressComponent = (props: IPropsGame) =>
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

const GameProgressLevel = (props: { id: string, gameProgress: Level }) => {
    let text = "Status Unknown"
    let className = ''
    if (props.gameProgress.bossObj && props.gameProgress.bossObj.playerSeen()) {
        text = props.gameProgress.text
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

const MonsterList = (props: IPropsGame) => {
    let items = props.game && props.game.getDisplayMobs().map((m, idx) =>
        <MonsterComponent
            name={m.name}
            color={m.color}
            infectable={m.isInfectable()}
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

interface IMonsterListItem {
    name: string
    color: string
    infectable: boolean
    debug: string
}

const MonsterComponent = (props: IMonsterListItem) =>
    <li style={{ color: props.color }}>
        {props.name}
        {props.infectable ? ' (infectable)' : ''}
        {props.debug}
    </li>

interface IPropsMessageGroup {
    text: Array<IUiMessageElement>
}

const Messages = (props: IPropsGame) => {
    let messager = props.game && props.game.getMessager()
    if (!messager) { return }
    let list = messager.getUiList()

    let outputlist = list.map((m: Array<IUiMessageElement>, idx: number) => <MessageGroup text={m} key={idx} />)

    return (
        <div style={{ clear: 'both' }}>
            <p id="msg">
                {outputlist}
            </p>
        </div>
    )
}

const MessageGroup = (props: IPropsMessageGroup) => {
    let list = props.text.map((m, idx) => <Message text={m.msg} key={idx} recent={m.recent} important={m.important} playerhit={m.playerhit} />)
    list.unshift(<Message key="-1" text={props.text[0].turns + ') '} recent={props.text[0].recent} />)
    // console.log('MessageGroup', list)
    return (
        <span>
            {list} <br />
        </span>
    )
}

interface IPropsMessage {
    recent?: boolean
    important?: boolean
    playerhit?: boolean
    text: string
}

const Message = (props: IPropsMessage) =>
    <span className={(props.recent ? '' : 'old-message') + ' ' + (props.important ? 'important-message' : '') + ' ' + (props.playerhit ? 'player-hit-message' : '')}>
        {props.text}&nbsp;
    </span>

export const BossSplash = (props: IPropsActor) => {
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

const AbilityList = (props: { abilities: Array<Ability> }) => {
    const listItems = props.abilities.map((a, idx) => <AbilityComponent ability={a} key={idx} />)
    return (
        <div style={{ clear: 'both' }}>
            <h3>Skills</h3>
            {listItems}
        </div>
    )
}

const AbilityComponent = (props: IPropsAbility) => {
    const ability = props.ability

    return (
        <div style={{ 'min-height': '75px' }}>
            <img src={Empty75x75}
                style={{ float: 'right' }}
                className={ability.constructor.name.toLowerCase() + '-ready'} />
            <p>
                <b>{ability.constructor.name}</b> Damage {ability.dmg}
                <br />
                Range {ability.range} Cooldown {ability.maxCooldown}
                <br /><br />
                {ability.mobsGetSideEffects() && ability.description}
            </p>
        </div >
    )
}

const BossText = (props: IPropsActor) =>
    <div>
        <h3>Bio</h3>
        <p>{props.actor.bio}</p>
        <p>{props.actor.quote}</p>
    </div>

const BossTraits = (props: IPropsActor) =>
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
