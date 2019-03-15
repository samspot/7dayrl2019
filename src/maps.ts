import * as ROT from 'rot-js'
import Config from './config.js'
import { Game } from './game'

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
}

interface IWallTileMap {
    [key: string]: number
}
let wallTileMap: IWallTileMap = {
    NWCorner: 0,
    NWall: 1,
    NWall2: 1,
    NECorner: 2,
    WWall: 3,
    WWall2: 3,
    WWall3: 3,
    Center: 4,
    EWall: 5,
    SWCorner: 6,
    SWall: 7,
    SECorner: 8,
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
    // '9': [1 * tileWidth, 1 * tileWidth], // placeholder
    'placeholder': [0 * tileWidth, 5 * tileWidth], // placeholder
    'tall': [1*tileWidth, 9*tileWidth],
    'wide': [0*tileWidth, 9*tileWidth],
    'corner0':[1*tileWidth, 7*tileWidth ],
    'corner1':[2*tileWidth, 7*tileWidth ],
    'corner2':[1*tileWidth, 8*tileWidth ],
    'corner3':[2*tileWidth, 8*tileWidth ],
    'point0': [0*tileWidth, 9*tileWidth],
    'point1': [0*tileWidth, 10*tileWidth],
    'point2': [1*tileWidth, 10*tileWidth],
    'point3': [0*tileWidth, 10*tileWidth],
}

interface IWallPreset {
    [key: string]: Array<Array<string>>
}

/*
North West = 2^0 = 1
North      = 2^1 = 2
North East = 2^2 = 4
West       = 2^3 = 8
East       = 2^4 = 16
South West = 2^5 = 32
South      = 2^6 = 64
South East = 2^7 = 128 

North      = 2^0 = 1
West       = 2^1 = 2
East       = 2^2 = 4 
South      = 2^3 = 8 
*/
interface IWM {
    [key: string]: {
        binary: number
        index: number
    }
}

/*
let wallMapBinary: IWM = {
    N: { binary: 0b00000001, index: 0 },
    W: { binary: 0b00000010, index: 1 },
    E: { binary: 0b00000100, index: 2 },
    S: { binary: 0b00001000, index: 3 },
}
*/

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


    // let isNwWall = isWall(getSquare('NW', coords, map))
    // let isNeWall = isWall(getSquare('NE', coords, map))
    // let isSwWall = isWall(getSquare('SW', coords, map))
    // let isSeWall = isWall(getSquare('SE', coords, map))

    let isNWall = isWall(getSquare('N', coords, map))
    let isWWall = isWall(getSquare('W', coords, map))
    let isEWall = isWall(getSquare('E', coords, map))
    let isSWall = isWall(getSquare('S', coords, map))

    let keys = ['N', 'S', 'E', 'W']

    /*
    if (isNwWall) {
        if (isNWall || isWWall) {
            keys.push('NW')
        }
    }
    if (isNeWall) {
        if (isNWall || isEWall) {
            keys.push('NE')
        }
    }
    if (isSwWall) {
        if (isWWall || isSwWall) {
            keys.push('SW')
        }
    }
    if (isSeWall) {
        if (isSWall || isEWall) {
            keys.push('SE')
        }
    }
    */

    // Object.keys(wallMapBinary).forEach(k => {
    keys.forEach(k => {
        let binary = wallMapBinary[k].binary
        let index = wallMapBinary[k].index
        let square = map[coords[index]]

        if (typeof square === 'undefined') {
            result = result | binary
        }
    })

    /*
    let translate = []
    translate[31] = wallMap['N']
    translate[30] = wallMap['N']
    translate[63] = wallMap['N']
    translate[62] = wallMap['N']
    translate[27] = wallMap['N']
    translate[159] = wallMap['N']
    translate[251] = wallMap['SW']
    translate[254] = wallMap['SE']
    translate[249] = wallMap['S']
    translate[248] = wallMap['S']
    translate[124] = wallMap['S']
    translate[252] = wallMap['S']
    translate[120] = wallMap['S']
    translate[216] = wallMap['S']
    translate[217] = wallMap['S']
    translate[202] = wallMap['W']
    translate[203] = wallMap['W']
    translate[235] = wallMap['W']
    translate[234] = wallMap['W']
    translate[207] = wallMap['W']
    translate[107] = wallMap['W']
    translate[119] = wallMap['E']
    translate[114] = wallMap['E']
    translate[118] = wallMap['E']
    translate[246] = wallMap['E']
    translate[214] = wallMap['E']
    translate[242] = wallMap['E']
    translate[223] = wallMap['NW']
    translate[127] = wallMap['NE']
    translate[75] = wallMap['W']
    translate[79] = wallMap['W']
    translate[64] = wallMap['-'] // todo middle end
    translate[2] = wallMap['-'] // todo middle end
    translate[9] = wallMap['-'] // todo middle end
    translate[96] = wallMap['-'] // todo middle end
    translate[192] = wallMap['-'] // todo middle end
    translate[126] = wallMap['-'] // TODO double corner
    translate[219] = wallMap['-'] // TODO double corner
    translate[91] = wallMap['-'] // TODO triple corner
    translate[115] = wallMap['-'] // TODO triple corner
    translate[22] = wallMap['-'] // TODO corner
    translate[10] = wallMap['-'] // TODO corner
    translate[54] = wallMap['-'] // TODO corner
    translate[20] = wallMap['-'] // TODO corner
    translate[112] = wallMap['-'] // TODO corner
    translate[15] = wallMap['-'] // TODO corner
    translate[11] = wallMap['-'] // TODO corner
    translate[8] = wallMap['-'] // TODO corner
    translate[200] = wallMap['-'] // TODO corner
    translate[240] = wallMap['-'] // TODO corner
    translate[80] = wallMap['-'] // TODO corner
    translate[22] = wallMap['-'] // TOOD corner
    translate[23] = wallMap['-'] // TOOD corner
    translate[222] = wallMap['-'] // TOOD corner
    translate[232] = wallMap['-'] // TOOD corner
    translate[72] = wallMap['-'] // TOOD corner
    translate[71] = wallMap['-'] // TODO middle wall
    translate[16] = wallMap['-'] // TODO middle wall
    translate[153] = wallMap['-'] // TODO middle wall
    translate[60] = wallMap['-'] // TODO middle wall
    translate[98] = wallMap['-'] // TODO middle wall
    translate[194] = wallMap['-'] // TODO middle wall
    translate[66] = wallMap['-'] // TODO middle wall
    translate[67] = wallMap['-'] // TODO middle wall
    translate[24] = wallMap['-'] // TODO middle wall
    translate[56] = wallMap['-'] // TODO middle wall
    translate[152] = wallMap['-'] // TODO middle wall
    translate[28] = wallMap['-'] // TODO middle wall
    translate[99] = wallMap['-'] // TODO middle wall
    translate[70] = wallMap['-'] // TODO middle wall
    translate[73] = wallMap['-'] // TODO
    translate[59] = wallMap['-'] // TODO
    translate[250] = wallMap['-'] // TODO
    translate[226] = wallMap['-'] // TODO
    translate[116] = wallMap['-'] // TODO
    translate[201] = wallMap['-'] // TODO
    translate[86] = wallMap['-'] // TODO
    translate[206] = wallMap['-'] // TODO
    translate[25] = wallMap['-'] // TODO
    translate[155] = wallMap['-'] // TODO
    translate[3] = wallMap['-'] // TODO
    translate[156] = wallMap['-'] // TODO
    translate[0] = wallMap['-'] // TODO
    translate[6] = wallMap['-'] // TODO
    translate[48] = wallMap['-'] // TODO
    translate[244] = wallMap['-'] // TODO
    */

    /* attempt 2 */
    // left, right, up, down
    let translate = []
    // translate[6] = wallMap['point2']
    // translate[8] = wallMap['S']
    // translate[9] = wallMap['S']
    // translate[15] = wallMap['N']



    /* attempt 3 */
    translate[90] = wallMap['SW']
    translate[2] = wallMap['point2']
    translate[64] = wallMap['point3']
    translate[18] = wallMap['point2']
    translate[66] = wallMap['tall']
    translate[26] = wallMap['N']
    translate[82] = wallMap['E']
    translate[88] = wallMap['S']
    translate[74] = wallMap['W']
    translate[10] = wallMap['point3']


    // translate[74] = wallMap['placeholder']

    let finalAnswer:any = translate[result]

    if (typeof finalAnswer === 'undefined') {
        console.log(`coords[0] ${coords[0]} map ${map[coords[0]]} calc ${x},${y} result ${result.toString(2)} result decimal ${result}`)
        console.log([coords[0], coords[1], coords[2]].map(c => map[c]).map(x => typeof x === 'undefined' ? '#' : x))
        console.log([coords[3], coords[4], coords[5]].map(c => map[c]).map(x => typeof x === 'undefined' ? '#' : x))
        console.log([coords[6], coords[7], coords[8]].map(c => map[c]).map(x => typeof x === 'undefined' ? '#' : x))
        finalAnswer = wallMap['placeholder']
    }
    return finalAnswer
}

export class Maps {
    mapList: {
        [key: string]: IMapSpec
    }
    game: Game

    constructor(game: Game) {
        this.game = game
        this.mapList = {
            lab: lab2Winner,
            catacombs: catacombs1Winner,
            outside: outside2Winner,
            guardhouse: guardhouse2Winner,
            mansion: mansion2Winner,
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
}


