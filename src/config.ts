import { MobSpec } from "./MobSpec";
import Jill from 'assets/jill.json';
import { Actor } from "./actor";
import { Ability, GrenadeLauncher } from "./abilities";

interface IConfig {
    seed?: number
    spawnrate?: number
    spawnboss: boolean
    tileWidth: number
    spawnLimit: number
    gamePortWidth: number
    gamePortHeight: number
    fontSize: number
    messageListSize: number
    turnsToSim?: number
    drawWholeMap: boolean
    drawAllMobs: boolean
    debug?: boolean
    skipTitle?: boolean
    tiles: boolean
    playerInvulnerable?: boolean
    startLevel?: number
    animate?: boolean
    enableCharge?: boolean
    logMissingTiles?: boolean
    ohko?: boolean
    firstBoss?: Actor
    playerTestSkill?: any
}

const Config: IConfig = {
    ohko: false,
    // spawnrate: 1,
    spawnboss: true,
    tileWidth: 16,
    spawnLimit: 20,
    gamePortWidth: 45,
    gamePortHeight: 27,
    fontSize: 16,
    messageListSize: 15,
    // seed: 1558298590300,
    // seed: 12364,
    // turnsToSim: 29,
    // turnsToSim: 26,
    // turnsToSim: 45,
    // seed: 12368,
    // seed: 12458,
    drawWholeMap: false,
    drawAllMobs: false,
    debug: false,
    skipTitle: false,
    tiles: true,
    enableCharge: false,
    playerInvulnerable: false,
    // startLevel: 1,
    animate: true,
    logMissingTiles: false,
    // firstBoss: Jill,
    // playerTestSkill: GrenadeLauncher
}

/*
floor colors:
    #cc9966 brown
    #669933 green
    #999999 grey
    ##CCCC99 pale green/olive
    #6699CC blue

wall colors:
    #006600 green
    #000000 black NO, this is empty space
    #ffffff white
    #330066 purple
    #660033 red

sprite colors:
    #330000 brown/red
    #ffff00 yellow (doesn't work in guardhouse)
    #330099 purple
    #0066cc blue
    #ff0099 pink
    #CC0000 dark orange
    #993300 gold/orange
*/

export default Config
