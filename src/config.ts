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
}

const Config: IConfig = {
    // spawnrate: 1,
    spawnboss: true,
    tileWidth: 16,
    spawnLimit: 20,
    gamePortWidth: 45,
    gamePortHeight: 27,
    fontSize: 16,
    messageListSize: 15,
    // seed: 12362,
    // turnsToSim: 15,
    // turnsToSim: 26,
    // turnsToSim: 0,
    // seed: 12368,
    // seed: 12370,
    drawWholeMap: false,
    drawAllMobs: false,
    debug: true,
    skipTitle: true,
    tiles: true,
    // playerInvulnerable: true,
    // startLevel: 0,
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
