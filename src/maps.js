import * as ROT from 'rot-js'


// 'lab'
// 'catacombs'
// 'outside' 
// 'guardhouse'
// 'mansion'
let outside1 = {
    _obj: ROT.Map.Digger,
    dugPercentage: .9,
    corridorLength: [10, 13],
    roomHeight: [4, 6],
    roomWidth: [4, 6],
    // timeLimit: undefined
}
let outside2Winner = {
    _obj: ROT.Map.Digger,
    dugPercentage: .5,
    corridorLength: [2, 5],
    roomHeight: [4, 6],
    roomWidth: [4, 6],
    // timeLimit: undefined
}
let lab1 = {
    _obj: ROT.Map.Digger,
    dugPercentage: .8,
    corridorLength: [4, 8],
    roomHeight: [5, 12],
    roomWidth: [5, 12],
    // timeLimit: undefined
}
let mansion1 = {
    _obj: ROT.Map.Digger,
    dugPercentage: .3,
    // corridorLength: [10, 13],
    roomHeight: [4, 6],
    roomWidth: [4, 6],
    // timeLimit: undefined
}
let mansion2Winner = {
    _obj: ROT.Map.Uniform,
    roomDugPercentage: .2,
    roomHeight: [4, 6],
    roomWidth: [4, 6],
    // timeLimit: undefined
}
let lab2Winner = {
    _obj: ROT.Map.Uniform,
    roomDugPercentage: .5,
    roomHeight: [6, 9],
    roomWidth: [6, 9],
    // timeLimit: undefined
}
let catacombs1Winner = {
    _obj: ROT.Map.Cellular,
    _iterations: 5,
    _randomize: 0.5,
    // born: undefined,
    // survive: undefined,
    // topology: undefined
}
let catacombs2 = {
    _obj: ROT.Map.Cellular,
    _iterations: 3,
    _randomize: 0.5,
    born: [4, 5, 6, 7, 8],
    survive: [2, 3, 4, 5],
    // topology: undefined
}

let field1 = {
    _obj: ROT.Map.Cellular,
    _iterations: 15,
    _randomize: 0.4,
    // born: [4, 5, 6, 7, 8],
    // survive: [2, 3, 4, 5],
    // topology: undefined
}

let guardhouse1 = {
    _obj: ROT.Map.Uniform,
    roomDugPercentage: .1,
    roomHeight: [2, 4],
    roomWidth: [2, 4],
    // timeLimit: undefined
}

let guardhouse2Winner = {
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

let wallTileMap = {
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

// TODO variations on walls & corners
let wallPresets = {
    NWCorner: [
        ['#','#','#'],
        ['#','#','#'],
        ['#','#','.'],
    ],
    NWall: [
        ['#','#','#'],
        ['#','#','#'],
        ['.','.','.'],
    ],
    NECorner: [
        ['#','#','#'],
        ['#','#','#'],
        ['.','#','#'],
    ],
    EWall: [
        ['.','#','#'],
        ['.','#','#'],
        ['.','#','#'],
    ],
    SECorner: [
        ['.','#','#'],
        ['#','#','#'],
        ['#','#','#'],
    ],
    SWall: [
        ['.','.','.'],
        ['#','#','#'],
        ['.','.','.'],
    ],
    SWCorner: [
        ['#','#','.'],
        ['#','#','#'],
        ['#','#','#'],
    ],
    WWall: [
        ['#','#','.'],
        ['#','#','.'],
        ['#','#','.'],
    ],
}

let joinedWallPresets = {}
Object.keys(wallPresets).forEach(key => {
    joinedWallPresets[key] = wallPresets[key].join(",")
})

let wallCalc = function(x, y){
    let coords = this.getCoordsAround(x, y).map(x => x.join(','))
    let result
    Object.keys(joinedWallPresets).forEach(key => {
        if(coords === joinedWallPresets[key]){
            result = wallTileMap[key]
        }
    })
    return result
}

class Maps {
    // TODO copied from abilities.js
    getCoordsAround(x, y) {
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

    getWallIndicator(x, y) {
        return wallCalc(x, y)
    }

    mapMap() {
        return {
            lab: lab2Winner,
            catacombs: catacombs1Winner,
            outside: outside2Winner,
            guardhouse: guardhouse2Winner,
            mansion: mansion2Winner
        }
    }

    getTileMap(){
        return tileMap
    }
}

export default Maps

