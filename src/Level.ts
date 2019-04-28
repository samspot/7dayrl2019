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
    // TODO remove question mark, old tiles
    tilesNew?: ImageData;
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

export const levels = [
    'lab',
    'catacombs',
    'outside',
    'guardhouse',
    'mansion'
]

// TODO: can i get rid of this?
export const levelNames = {
    'lab': 'Laboratory',
    'catacombs': 'Catacombs',
    'outside': 'Garden',
    'guardhouse': 'Guardhouse',
    'mansion': 'Mansion'
}

function gpToString() {
    return `${this.name} ${this.boss} bossDown? ${this.bossDown} level:${this.level}`
}

export class GameProgress {
    level0: Level
    level1: Level
    level2: Level
    level3: Level
    level4: Level
    [key: string]: Level
    constructor() {
        this.level0 = new Level(0, 'The Laboratory', 'lab', '#999999', '#ffffff', 3, ReTiles16LabNew)
        this.level1 = new Level(1, 'Catacombs', 'catacombs', '#cc9966', '#660033', 7, ReTiles16CatacombsNew)
        this.level2 = new Level(2, 'Garden', 'outside', '#cc9966', '#006600', 6, ReTiles16OutsideNew)
        this.level3 = new Level(3, 'Guardhouse', 'guardhouse', '#cccc99', '#330066', 4, ReTiles16GuardhouseNew)
        this.level4 = new Level(4, 'The Mansion', 'mansion', '#6699cc', '#660033', 5, ReTiles16MansionNew)
    }
}
