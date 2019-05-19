import * as  React from "react"
import * as ReactDOM from "react-dom"
import Empty75x75 from '../assets/img/empty.png'
import { Ability } from "./abilities";
import { Player } from "./player";
import { IPropsPlayer } from "./jsxinterface";
import { Actor } from "./actor";
import { Game } from "./game";

interface IPropsPlayerSkill extends IPropsSkill {
    hotkey: string
    ability: Ability
}

interface IPropsSkill {
    name: string
    dmg?: number
    range?: number
    cooldown: number
    description?: string
}

export class StatusBar extends React.Component<{ player: Player, game: Game, onClick: Function }> {
    render() {

        let name = this.props.player && this.props.player.nickname

        let hp = this.props.player && this.props.player.hp

        let gp = this.props.game.getGameProgress()
        let director = this.props.game.director

        let boss = director && director.boss
        let bossSeen = false

        let bossObj = this.props.game.getBosses()
        let bossName = bossObj && bossObj.nickname
        if (bossObj && bossObj.playerSeen()) {
            bossSeen = true
            if (this.props.game.levelBossPassed()) {
                bossName += '-eliminated'
            }
        } else {
            bossName = 'unknown'
        }

        let maxHp = this.props.player && this.props.player.maxHp

        return (
            <div id="status-bar">
                <Portrait name={name + '-dead'} id="portrait2" actor={this.props.player} />
                <Condition hp={hp} maxHp={maxHp} />
                <Portrait name={bossName} id="target" actor={this.props.game.getBosses()} bossSeen={bossSeen} />
                <PlayerSkillList player={this.props.player} />
                <span id="name"> {name} </span>
                <span id="hp">{hp}</span>
                <span id="score">{this.props.game.score}</span>
            </div>
        )
    }
}



class Condition extends React.Component<{ hp: number, maxHp: number }> {
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


class Portrait extends React.Component<{ actor: Actor, name: string, id: string, bossSeen?: boolean }> {
    render() {
        let seen = (this.props.actor && this.props.actor.isPlayer()) || (this.props.actor && this.props.actor.boss && this.props.actor.seen)
        let { name, hp, maxHp, str, nick } = { name: 'unknown', hp: '?', maxHp: '?', str: '?', nick: 'unknown' }
        if (seen) {
            hp = this.props.actor.hp + ''
            maxHp = this.props.actor.maxHp + ''
            str = this.props.actor.str + ''
            name = this.props.actor && this.props.actor.name
        }
        return (
            <div id={this.props.id} className={this.props.name + ' tooltip'}>
                <img src={Empty75x75} />
                <span className="tooltiptext">
                    <b>{name}</b>
                    <br /> <br />
                    HP {hp + '/' + maxHp}
                    <br />
                    Melee Damage: {str}
                </span>
            </div>
        )
    }
}


const PlayerSkillList = (props: IPropsPlayer) => {
    let abilities: Ability[] = []
    if (props.player) {
        abilities = props.player.getAbilities()
        // abilities.map(a => {
        // a.name = a.constructor.name
        // })
    }

    return (
        <div id='ability-icons'>
            {abilities[0] &&
                <PlayerSkill hotkey='Q' cooldown={abilities[0].cooldown} name={abilities[0].name} ability={abilities[0]} />
            }
            {abilities[1] &&
                <PlayerSkill hotkey='E' cooldown={abilities[1].cooldown} name={abilities[1].name} ability={abilities[1]} />
            }
            {abilities[2] &&
                <PlayerSkill hotkey='R' cooldown={abilities[2].cooldown} name={abilities[2].name} ability={abilities[2]} />
            }
        </div>
    )
}

const PlayerSkill = (props: IPropsPlayerSkill) => {
    let name = props.name
    if (name.toLowerCase() === "grenadelauncher") {
        name = "Launcher"
    }
    return (
        <div className='ability-super-container'>
            <div className='container0 tooltip'>
                <div className='bottom-left0'>{props.hotkey}</div>
                <img src={Empty75x75} className={props.name.toLowerCase() + (props.cooldown > 0 ? '-cooldown' : '-ready') + ' ability-icon'} />
                <div className='center0'>{props.cooldown > 0 ? props.cooldown : ''}</div>
                <PlayerSkillTooltip name={props.name} dmg={props.ability.dmg} range={props.ability.range}
                    cooldown={props.ability.maxCooldown} description={props.ability.description} />
            </div>
            <span className="ability-name">{name}</span>
        </div>
    )
}

const PlayerSkillTooltip = (props: IPropsSkill) => {
    return (
        <span className='tooltiptext'>
            <p>
                <b>{props.name}</b>
            </p>
            Damage {props.dmg} <br />
            Range {props.range} <br />
            Cooldown {props.cooldown}
            <p>
                {props.description}
            </p>
        </span>
    )
}


