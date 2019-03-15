/*

/*
let wallMapBinary: IWM = {
    N: { binary: 0b00000001, index: 0 },
    W: { binary: 0b00000010, index: 1 },
    E: { binary: 0b00000100, index: 2 },
    S: { binary: 0b00001000, index: 3 },
}

let wallMapBinary: IWM = {
    N: { binary: 0b0001, index: 1 },
    W: { binary: 0b0010, index: 2 },
    E: { binary: 0b0100, index: 4 },
    S: { binary: 0b1000, index: 8 },
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
/*
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
*/
    /*



    let isNWall = isWall(getSquare('N', coords, map))
    let isWWall = isWall(getSquare('W', coords, map))
    let isEWall = isWall(getSquare('E', coords, map))
    let isSWall = isWall(getSquare('S', coords, map))
    // let isNwWall = isWall(getSquare('NW', coords, map))
    // let isNeWall = isWall(getSquare('NE', coords, map))
    // let isSwWall = isWall(getSquare('SW', coords, map))
    // let isSeWall = isWall(getSquare('SE', coords, map))
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



    /* attempt 3 */
    /*
    translate[90] = wallMap['SW']
    translate[2] = wallMap['point2']
    translate[64] = wallMap['point3']
    translate[18] = wallMap['point2']
    translate[80] = wallMap['point3']
    translate[66] = wallMap['tall']
    translate[26] = wallMap['N']
    translate[82] = wallMap['E']
    translate[88] = wallMap['S']
    translate[74] = wallMap['W']
    */

    // translate[10] = wallMap['point3']
    // translate[74] = wallMap['placeholder']
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

