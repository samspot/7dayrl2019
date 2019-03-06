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

const Maps = {
    lab: lab2Winner,
    catacombs: catacombs1Winner,
    outside: outside2Winner,
    guardhouse: guardhouse2Winner,
    mansion: mansion2Winner
}

export default Maps

