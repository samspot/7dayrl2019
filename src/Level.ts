import ReTiles16LabNew from '../assets/img/re-tiles-16-lab-new.png';
import ReTiles16CatacombsNew from '../assets/img/re-tiles-16-catacombs-new.png';
import ReTiles16OutsideNew from '../assets/img/re-tiles-16-outside-new.png';
import ReTiles16MansionNew from '../assets/img/re-tiles-16-mansion-new.png';
import ReTiles16GuardhouseNew from '../assets/img/re-tiles-16-guardhouse-new.png';
import { Actor } from './actor';

export class Level {
    level: number;
    name: string;
    nickname: string
    bossNickName: string
    boss?: string;
    floorColor: string;
    wallColor: string;
    spawnRate: number;
    text: string;
    style: string;
    bossDown: boolean;
    toString: Function = function () {
        return gpToString();
    };
    tilesNew: ImageData;
    bossObj?: Actor;
    score: number

    constructor(idx: number, name: string, nickname: string, floorcolor: string, wallcolor: string, spawnrate: number, tiles: any) {
        this.level = idx
        this.name = name
        this.nickname = nickname
        this.floorColor = floorcolor
        this.wallColor = wallcolor
        this.spawnRate = spawnrate
        this.tilesNew = tiles

        this.text = "Status Unknown"
        this.bossNickName = ""
        this.style = "font-style: italic"
        this.bossDown = false
        this.score = 10000 - idx * 2000
    }
}

function gpToString() {
    return `${this.name} ${this.boss} bossDown? ${this.bossDown} level:${this.level}`
}

export function getCoordsAround(x: number, y: number) {
    return [
        [x - 1, y - 1], // NW
        [x, y - 1],     // N
        [x + 1, y - 1], // NE
        [x + 1, y],     // E
        [x + 1, y + 1], // SE
        [x, y + 1],     // S
        [x - 1, y + 1], // SW
        [x - 1, y],     // W
    ]
}

export class GameProgress {
    level0: Level
    level1: Level
    level2: Level
    level3: Level
    level4: Level
    constructor() {
        this.level0 = new Level(0, 'The Laboratory', 'lab', '#999999', '#ffffff', 3, ReTiles16LabNew)
        this.level1 = new Level(1, 'Catacombs', 'catacombs', '#cc9966', '#660033', 7, ReTiles16CatacombsNew)
        this.level2 = new Level(2, 'Garden', 'outside', '#cc9966', '#006600', 6, ReTiles16OutsideNew)
        this.level3 = new Level(3, 'Guardhouse', 'guardhouse', '#cccc99', '#330066', 4, ReTiles16GuardhouseNew)
        this.level4 = new Level(4, 'The Mansion', 'mansion', '#6699cc', '#660033', 5, ReTiles16MansionNew)
    }

    getCurrentLevel(idx: number) {
        return [
            this.level0,
            this.level1,
            this.level2,
            this.level3,
            this.level4
        ][idx]
    }
}
