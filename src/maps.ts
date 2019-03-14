import * as ROT from 'rot-js'
import Config from './config.js'

// 'lab'
// 'catacombs'
// 'outside' 
// 'guardhouse'
// 'mansion'
export interface IMapSpec {
    _obj: Object,
    _randomize?: number
    _iterations?: number
}

interface IDiggerMapSpec extends IMapSpec {
    dugPercentage: number,
    corridorLength: Array<number>,
    roomHeight: Array<number>,
    roomWidth: Array<number>,
}
interface IUniformMapSpec extends IMapSpec {
    roomDugPercentage: number,
    roomHeight: Array<number>,
    roomWidth: Array<number>
}
interface ICellularMapSpec extends IMapSpec {
    _iterations: number,
    _randomize: number
}



let outside1: IDiggerMapSpec = {
    _obj: ROT.Map.Digger,
    dugPercentage: .9,
    corridorLength: [10, 13],
    roomHeight: [4, 6],
    roomWidth: [4, 6],
}
let outside2Winner: IDiggerMapSpec = {
    _obj: ROT.Map.Digger,
    dugPercentage: .5,
    corridorLength: [2, 5],
    roomHeight: [4, 6],
    roomWidth: [4, 6],
}
let lab1: IDiggerMapSpec = {
    _obj: ROT.Map.Digger,
    dugPercentage: .8,
    corridorLength: [4, 8],
    roomHeight: [5, 12],
    roomWidth: [5, 12],
}
let mansion1: IDiggerMapSpec = {
    _obj: ROT.Map.Digger,
    dugPercentage: .3,
    corridorLength: [10, 13],
    roomHeight: [4, 6],
    roomWidth: [4, 6],
}
let mansion2Winner: IUniformMapSpec = {
    _obj: ROT.Map.Uniform,
    roomDugPercentage: .2,
    roomHeight: [4, 6],
    roomWidth: [4, 6],
    // timeLimit: undefined
}
let lab2Winner: IUniformMapSpec = {
    _obj: ROT.Map.Uniform,
    roomDugPercentage: .5,
    roomHeight: [6, 9],
    roomWidth: [6, 9],
    // timeLimit: undefined
}
let catacombs1Winner: ICellularMapSpec = {
    _obj: ROT.Map.Cellular,
    _iterations: 5,
    _randomize: 0.5,
    // born: undefined,
    // survive: undefined,
    // topology: undefined
}
let catacombs2: ICellularMapSpec = {
    _obj: ROT.Map.Cellular,
    _iterations: 3,
    _randomize: 0.5,
    // born: [4, 5, 6, 7, 8],
    // survive: [2, 3, 4, 5],
    // topology: undefined
}

let field1: ICellularMapSpec = {
    _obj: ROT.Map.Cellular,
    _iterations: 15,
    _randomize: 0.4,
    // born: [4, 5, 6, 7, 8],
    // survive: [2, 3, 4, 5],
    // topology: undefined
}

let guardhouse1: IUniformMapSpec = {
    _obj: ROT.Map.Uniform,
    roomDugPercentage: .1,
    roomHeight: [2, 4],
    roomWidth: [2, 4],
    // timeLimit: undefined
}

let guardhouse2Winner: IDiggerMapSpec = {
    _obj: ROT.Map.Digger,
    dugPercentage: .1,
    corridorLength: [3, 6],
    roomHeight: [3, 6],
    roomWidth: [3, 6],
    // timeLimit: undefined
}

let wallMap = {
    NW: 0,
    N: 1,
    NE: 2,
    W: 3,
    C: 4,
    E: 5,
    SE: 6,
    S: 7,
    SW: 8
}

interface IWallTileMap {
    [key: string]: number
}
let wallTileMap: IWallTileMap = {
    NWCorner: 0,
    NWall: 1,
    NECorner: 2,
    WWall: 3,
    Center: 4,
    EWall: 5,
    SECorner: 6,
    SWall: 7,
    SWCorner: 8
}

let tileWidth = Config.tileWidth

let tileMap = {
    "@": [0 * tileWidth, 3 * tileWidth],
    "J": [1 * tileWidth, 3 * tileWidth],
    "C": [2 * tileWidth, 3 * tileWidth],
    "B": [0 * tileWidth, 4 * tileWidth],
    "V": [1 * tileWidth, 4 * tileWidth],
    "W": [2 * tileWidth, 4 * tileWidth],
    "s": [0 * tileWidth, 5 * tileWidth],
    "p": [1 * tileWidth, 5 * tileWidth],
    "L": [2 * tileWidth, 5 * tileWidth],
    "d": [0 * tileWidth, 6 * tileWidth],
    "c": [1 * tileWidth, 6 * tileWidth],
    "h": [2 * tileWidth, 6 * tileWidth],
    "z": [0 * tileWidth, 7 * tileWidth],
    "#": [0 * tileWidth, 0 * tileWidth],
    '.': [1 * tileWidth, 1 * tileWidth],
    '_': [1 * tileWidth, 1 * tileWidth],
    '': [1 * tileWidth, 1 * tileWidth],
    '0': [0 * tileWidth, 0 * tileWidth],
    '1': [1 * tileWidth, 0 * tileWidth],
    '2': [2 * tileWidth, 0 * tileWidth],
    '3': [0 * tileWidth, 1 * tileWidth],
    '4': [1 * tileWidth, 1 * tileWidth],
    '5': [2 * tileWidth, 1 * tileWidth],
    '6': [0 * tileWidth, 2 * tileWidth],
    '7': [1 * tileWidth, 2 * tileWidth],
    '8': [2 * tileWidth, 2 * tileWidth],
}

interface IWallPreset {
    [key: string]: Array<Array<string>>
}


// TODO variations on walls & corners
let wallPresets: IWallPreset = {
    NWCorner: [
        ['#', '#', '#'],
        ['#', '#', '#'],
        ['#', '#', '.'],
    ],
    NWall: [
        ['#', '#', '#'],
        ['#', '#', '#'],
        ['.', '.', '.'],
    ],
    NECorner: [
        ['#', '#', '#'],
        ['#', '#', '#'],
        ['.', '#', '#'],
    ],
    EWall: [
        ['.', '#', '#'],
        ['.', '#', '#'],
        ['.', '#', '#'],
    ],
    SECorner: [
        ['.', '#', '#'],
        ['#', '#', '#'],
        ['#', '#', '#'],
    ],
    SWall: [
        ['.', '.', '.'],
        ['#', '#', '#'],
        ['.', '.', '.'],
    ],
    SWCorner: [
        ['#', '#', '.'],
        ['#', '#', '#'],
        ['#', '#', '#'],
    ],
    WWall: [
        ['#', '#', '.'],
        ['#', '#', '.'],
        ['#', '#', '.'],
    ],
}

interface IJoinedWallPreset {
    [key: string]: string
}
let joinedWallPresets: IJoinedWallPreset = {}
Object.keys(wallPresets).forEach(key => {
    joinedWallPresets[key] = wallPresets[key].join(",")
})

let wallCalc = function (x: number, y: number) {
    let coords = this.getCoordsAround(x, y).map((x: Array<number>) => x.join(','))
    let result
    Object.keys(joinedWallPresets).forEach(key => {
        if (coords === joinedWallPresets[key]) {
            result = wallTileMap[key]
        }
    })
    return result
}

export class Maps {
    mapList: {
        [key: string]: IMapSpec
    }

    constructor() {
        this.mapList = {
            lab: lab2Winner,
            catacombs: catacombs1Winner,
            outside: outside2Winner,
            guardhouse: guardhouse2Winner,
            mansion: mansion2Winner,
        }
    }
    // TODO copied from abilities.js
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

    getWallIndicator(x: number, y: number) {
        return wallCalc(x, y)
    }

    mapMap() {
        return this.mapList
    }

    getTileMap() {
        return tileMap
    }
}


