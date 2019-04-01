import Empty75x75 from '../assets/img/empty.png'
import * as  React from "react"
import * as ReactDOM from "react-dom"
import { Ability } from './abilities';
import { Actor } from './actor';

export const render = () => {
    ReactDOM.render(<GameComponent />, document.getElementById("gamediv"));
}

export const GameComponent = () =>
    <div id="game" className="game">
        <h2 id="title">KILL S.T.A.R.S</h2>
        <StatusBar />
        <Level />
        <MainContainer />
        <Messages />
    </div>

const StatusBar = () =>
    <div id="status-bar">
        <div id="portrait2"></div>
        <div id="condition"></div>
        <div id="target">TARGET</div>
        <div id="ability-icons"></div>
        <span id="name"></span>
        <span id="hp"></span>
        <span id="score"></span>
    </div>

const Level = () =>
    <span id="level" />

const MainContainer = () =>
    <div className="main-container">
        <div style={{ float: 'left' }}>
            <div style={{ float: 'left' }} id="mapContainer"></div>
        </div>
        <div id="right-bar">
            <div id="monster-container">
                <h3>Monsters</h3>
                <ol id="monsters">
                </ol>
            </div>
            <div id="progress-container">
                <h3>Game Progress</h3>
                <ul id="progress">
                    <li id="level0">Status Unknown</li>
                    <li id="level1">Status Unknown</li>
                    <li id="level2">Status Unknown</li>
                    <li id="level3">Status Unknown</li>
                    <li id="level4">Status Unknown</li>
                </ul>
            </div>
        </div>
    </div>

const Messages = () =>
    <div style={{ clear: 'both' }}>
        <p id="msg"></p>
    </div>

export const bossSplash = (actor: Actor) =>
    <div>
        <div style={{ float: 'left', width: '50%' }}>
            <img src={Empty75x75} id='boss-splash' />
        </div>
        <div style={{ float: 'right', width: '50%' }}>
            {bossTraits(actor)}
        </div>
        <div style={{ clear: 'both' }}>
            <h3>Skills</h3>
            {actor.abilities.map(i => ability(i))}
        </div>
        {bossText(actor)}
    </div>

const bossText = (actor: Actor) =>
    <div>
        <h3>Bio</h3>
        <p>{actor.bio}</p>
        <p>{actor.quote}</p>
    </div>

const bossTraits = (actor: Actor) =>
    <div>
        <span style={{ color: 'red' }}>TARGET</span>
        <p style={{ padding: 0, margin: 0 }}>
            <b>{actor.name}</b>
        </p>
        <p style={{ padding: 0, margin: 0 }}>
            HP {actor.hp}/{actor.maxHp}
        </p>
        <p style={{ padding: 0, margin: 0 }}>
            Melee Damage {actor.str}
        </p>
    </div>

// const bossAbilities = (actor: Actor) =>
const ability = (a: Ability) =>
    <div style={{ height: '75px' }} key={a.constructor.name}>
        <img src={Empty75x75}
            style={{ float: 'right', marginTop: '-18px' }}
            className={a.constructor.name.toLowerCase() + '-ready'} />
        <p>
            <b>{a.constructor.name}</b> Damage {a.dmg}
            <br />
            Range {a.range} Cooldown {a.maxCooldown}
        </p>
    </div >

// export const bossSplash = (abilities: Array<Element>, actor: Actor) => {
// export const bossSplash = (actor: Actor) => {
    // return bossModal(actor)
// }
