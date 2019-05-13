import { Map, DiggerOptions, DigCallback, UniformOptions, CellularOptions } from 'rot-js'
import { Game } from './game'
import Config from './config';


export interface IGameMap {
    [key: string]: string
}

let wallMap = {
    NW: 0,
    N: 1,
    NE: 2,
    W: 3,
    C: 4,
    E: 5,
    SW: 6,
    S: 7,
    SE: 8,
    '-': 9,
    'placeholder': 'placeholder',
    'tall': 'tall',
    'wide': 'wide',
    'corner0': 'corner0',
    'corner1': 'corner1',
    'corner2': 'corner2',
    'corner3': 'corner3',
    'point0': 'point0',
    'point1': 'point1',
    'point2': 'point2',
    'point3': 'point3',
    'pillar': 'pillar'
}

let tileWidth = Config.tileWidth

export interface TileMapKey {
    key: string
    x: number
    y: number
}

let hasFrame2 = [
    "d",
    "c",
    "L",
    "z",
    "h",
    "p",
    "#",
    "b",
    "s",
    "K",
    "R",
    "A",
    "x",
    "m",
    "H",
    "k",
    "y",
    "@",
    "J",
    "C",
    "B",
    "V",
    "W",
    "T",
    "!"
]



interface TileMap {
    [key: string]: Array<number>
}

let tileMap: TileMap = {
    'placeholder': [0, 7], // placeholder
    "d": [0, 8],  // dog
    "c": [0, 9],  // chimera
    "L": [0, 10], // Lisa
    "z": [0, 11], // zombie
    "h": [0, 12], // hunter
    "p": [0, 13], // spider
    "#": [0, 14], // reticle
    "b": [0, 15], // blood pool
    "s": [0, 16], // shark

    "@": [0, 17], // player
    "T": [0, 17], // player
    "J": [0, 18], // Jill
    "C": [0, 19], // Chris
    "B": [0, 20], // Barry
    "V": [0, 21], // Brad
    "W": [0, 22], // Wesker

    "x": [0, 23], // Rebecca Chambers
    "y": [0, 24], // Billy Coen
    "H": [0, 25], // Hunk
    "K": [0, 26], // Leon Kennedy
    "R": [0, 27], // Claire Redfield
    "A": [0, 28], // Ada Wong
    "k": [0, 29], // Krauser
    "m": [0, 30], // William Birkin
    ">": [0, 31],  // stairs
    '*': [0, 32], // boom
    '!': [0, 33], // stun

    '.': [1, 1],
    '_': [1, 1],
    '': [1, 1],
    '0': [0, 0],
    '1': [1, 0],
    '2': [2, 0],
    '3': [0, 1],
    '4': [1, 1],
    '5': [2, 1],
    '6': [0, 2],
    '7': [1, 2],
    '8': [2, 2],

    'tall': [0, 5],
    'wide': [1, 5],
    'pillar': [0, 7],
    'corner0': [0, 3], // NW Point
    'corner2': [0, 4], // SW Point
    'corner1': [1, 3], // NE Point
    'corner3': [1, 4], // SE Point

    'point1': [2, 5], // N
    'point2': [0, 6], // S 
    'point3': [2, 3],
    'point0': [2, 4],
}

// Add the tile widths
Object.keys(tileMap).forEach((k: any) => {
    let x = tileMap[k][0]
    let y = tileMap[k][1]
    tileMap[k] = [x * tileWidth, y * tileWidth]
})

interface IWM {
    [key: string]: {
        binary: number
        index: number
    }
}

let wallMapBinary: IWM = {
    NW: { binary: 0b00000001, index: 0 },
    N: { binary: 0b00000010, index: 1 },
    NE: { binary: 0b00000100, index: 2 },
    W: { binary: 0b00001000, index: 3 },
    E: { binary: 0b00010000, index: 5 },
    SW: { binary: 0b00100000, index: 6 },
    S: { binary: 0b01000000, index: 7 },
    SE: { binary: 0b10000000, index: 8 }
}

let getSquare = function (direction: string, coords: Array<string>, map: { [key: string]: string }) {
    return map[coords[wallMapBinary[direction].index]]
}

let isWall = function (tile: string) {
    return typeof tile === 'undefined'
}

let calc = function (x: number, y: number, coords: Array<string>, map: { [key: string]: string }) {
    let result = 0

    let keys = ['N', 'S', 'E', 'W']

    let isNWall = isWall(getSquare('N', coords, map))
    let isWWall = isWall(getSquare('W', coords, map))
    let isEWall = isWall(getSquare('E', coords, map))
    let isSWall = isWall(getSquare('S', coords, map))
    let isNwWall = isWall(getSquare('NW', coords, map))
    let isNeWall = isWall(getSquare('NE', coords, map))
    let isSwWall = isWall(getSquare('SW', coords, map))
    let isSeWall = isWall(getSquare('SE', coords, map))

    let nwHasFriends = isNwWall && isNWall && isWWall
    if (nwHasFriends) {
        keys.push('NW')
    }
    let neHasFriends = isNeWall && isNWall && isEWall
    if (neHasFriends) {
        keys.push('NE')
    }
    let swHasFriends = isSWall && isWWall && isSWall
    if (swHasFriends) {
        keys.push('SW')
    }
    let seHasFriends = isSeWall && isSWall && isEWall
    if (seHasFriends) {
        keys.push('SE')
    }

    // Object.keys(wallMapBinary).forEach(k => {
    keys.forEach(k => {
        let binary = wallMapBinary[k].binary
        let index = wallMapBinary[k].index
        let square = map[coords[index]]

        if (typeof square === 'undefined') {
            result = result | binary
        }
    })
    let translate = []

    translate[0] = wallMap.pillar
    translate[222] = wallMap.pillar
    translate[218] = wallMap.pillar
    translate[123] = wallMap.pillar

    translate[75] = wallMap.W
    translate[74] = wallMap.W
    translate[107] = wallMap.W
    translate[106] = wallMap.W

    translate[31] = wallMap.N
    translate[30] = wallMap.N
    translate[27] = wallMap.N
    translate[95] = wallMap.N

    translate[86] = wallMap.E
    translate[214] = wallMap.E
    translate[210] = wallMap.E

    translate[248] = wallMap.S
    translate[216] = wallMap.S
    translate[120] = wallMap.S
    translate[250] = wallMap.S

    translate[64] = wallMap.point1
    translate[2] = wallMap.point2
    translate[8] = wallMap.point3
    translate[16] = wallMap.point0

    translate[104] = wallMap.corner1
    translate[72] = wallMap.corner1
    translate[22] = wallMap.corner2
    translate[11] = wallMap.corner3
    translate[80] = wallMap.corner0
    translate[208] = wallMap.corner0

    translate[66] = wallMap.tall
    translate[91] = wallMap.tall
    translate[126] = wallMap.tall
    translate[82] = wallMap.tall
    translate[219] = wallMap.tall
    translate[24] = wallMap.wide


    translate[251] = wallMap.SW
    translate[223] = wallMap.NW
    translate[254] = wallMap.SE
    translate[127] = wallMap.NE

    let finalAnswer: any = translate[result]

    if (typeof finalAnswer === 'undefined' && Config.logMissingTiles) {
        console.log(`coords[0] ${coords[0]} map ${map[coords[0]]} calc ${x},${y} result ${result.toString(2)} result decimal ${result}`)
        console.log(`NW ${isNwWall} NE ${isNeWall} SW ${isSwWall} SE ${isSeWall}`)
        console.log([coords[0], coords[1], coords[2]].map(c => map[c]).map(x => typeof x === 'undefined' ? '#' : x))
        console.log([coords[3], coords[4], coords[5]].map(c => map[c]).map(x => typeof x === 'undefined' ? '#' : x))
        console.log([coords[6], coords[7], coords[8]].map(c => map[c]).map(x => typeof x === 'undefined' ? '#' : x))
        finalAnswer = wallMap['placeholder']
    }
    return finalAnswer
}

export class Maps {
    mapList: {
        [key: string]: Function
    }
    game: Game

    constructor(game: Game) {
        this.game = game
        this.mapList = {
            lab: lab(),
            catacombs: catacombs(),
            outside: outside(),
            guardhouse: guardhouse(),
            mansion: mansion(),
        }
    }

    wallCalc(x: number, y: number) {
        let coords = this.getCoordsAround(x, y).map((x: Array<number>) => x.join(','))
        let finalAnswer = calc(x, y, coords, this.game.map)

        if (typeof finalAnswer === 'undefined') {
            return '5'
        }

        return finalAnswer + ''
    }

    // not the same as the one from levels.ts
    getCoordsAround(x: number, y: number) {
        return [
            [x - 1, y - 1], // NW
            [x, y - 1],     // N
            [x + 1, y - 1], // NE
            [x - 1, y],     // W
            [x, y],         // C
            [x + 1, y],     // E
            [x + 1, y + 1], // SE
            [x, y + 1],     // S
            [x - 1, y + 1], // SW
        ]
    }

    getCardinalCoordsAround(x: number, y: number) {
        return [
            [x, y - 1],     // N
            [x - 1, y],     // W
            [x, y],         // C
            [x + 1, y],     // E
            [x, y + 1],     // S
        ]
    }


    getWallIndicator(x: number, y: number) {
        return this.wallCalc(x, y)
    }

    mapMap() {
        return this.mapList
    }

    getTileMap() {
        return tileMap
    }

    getFrameSet(tileMap: any) {
        return hasFrame2.map((k: string) => {

            return {
                key: k,
                x: tileMap[k][0],
                y: tileMap[k][1]
            }
        })
    }
}

function digger(options: DiggerOptions) {
    return function (x: number, y: number, digCallback: DigCallback) {
        let generator = new Map.Digger(x, y, options)
        generator.create(digCallback)
    }
}

function uniform(options: UniformOptions) {
    return function (x: number, y: number, digCallback: DigCallback) {
        let generator = new Map.Uniform(x, y, options)
        generator.create(digCallback)
    }
}

function cellular(randomize: number, iterations: number, options: CellularOptions) {
    return function (x: number, y: number, digCallback: DigCallback) {
        let generator = new Map.Cellular(x, y, options)

        generator.randomize(randomize)

        for (let i = 0; i < iterations - 1; i++) {
            generator.create()
        }

        generator.create(digCallback)

        generator.connect(digCallback)
    }
}

function lab() {
    return uniform({
        roomDugPercentage: .5,
        roomHeight: [6, 9],
        roomWidth: [6, 9]
    })
}

function outside() {
    return digger({
        dugPercentage: .5,
        corridorLength: [2, 5],
        roomHeight: [4, 6],
        roomWidth: [4, 6]
    })
}

function catacombs() {
    let randomize = 0.5
    let iterations = 5

    return cellular(randomize, iterations, {})
}

function guardhouse() {
    return digger({
        dugPercentage: .1,
        corridorLength: [3, 6],
        roomHeight: [3, 6],
        roomWidth: [3, 6]
    })
}

function mansion() {
    return uniform({
        roomDugPercentage: .2,
        roomHeight: [4, 6],
        roomWidth: [4, 6]
    })
}