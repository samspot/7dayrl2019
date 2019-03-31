import ReTiles16CatacombsF2 from '../assets/img/re-tiles-16-catacombs-f2.png';
import ReTiles16Catacombs from '../assets/img/re-tiles-16-catacombs.png';
import ReTiles16GuardhouseF2 from '../assets/img/re-tiles-16-guardhouse-f2.png';
import ReTiles16Guardhouse from '../assets/img/re-tiles-16-guardhouse.png';
import ReTiles16LabF2 from '../assets/img/re-tiles-16-lab-f2.png';
import ReTiles16Lab from '../assets/img/re-tiles-16-lab.png';
import ReTiles16MansionF2 from '../assets/img/re-tiles-16-mansion-f2.png';
import ReTiles16Mansion from '../assets/img/re-tiles-16-mansion.png';
import ReTiles16OutsideF2 from '../assets/img/re-tiles-16-outside-f2.png';
import ReTiles16Outside from '../assets/img/re-tiles-16-outside.png';

export class Level {
    level: number;
    name: string;
    boss: string;
    floorColor: string;
    wallColor: string;
    spawnRate: number;
    text: string;
    style: string;
    bossDown: boolean;
    toString: Function = function () {
        return gpToString();
    };
    tiles: ImageData;
    tilesf2: ImageData;
}

export const levels = [
    'lab',
    'catacombs',
    'outside',
    'guardhouse',
    'mansion'
]

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

// TODO remove this duplicate info (also in director.levelNames)
export class GameProgress {
    level0: Level
    level1: Level
    level2: Level
    level3: Level
    level4: Level
    [key: string]: Level
    constructor() {
        this.level0 = {
            level: 0,
            name: "The Laboratory",
            boss: "Jill Valentine",
            floorColor: '#999999',
            wallColor: '#ffffff',
            spawnRate: 3,
            text: "Status Unknown",
            style: "font-style: italic",
            bossDown: false,
            tiles: ReTiles16Lab,
            tilesf2: ReTiles16LabF2
        }

        this.level1 = {
            level: 1,
            name: "Catacombs",
            boss: "Chris Redfield",
            floorColor: '#cc9966',
            wallColor: '#660033',
            spawnRate: 7,
            text: "Status Unknown",
            style: "font-style: italic",
            bossDown: false,
            tiles: ReTiles16Catacombs,
            tilesf2: ReTiles16CatacombsF2,
        }

        this.level2 = {
            level: 2,
            name: "Garden",
            boss: "Barry Burton",
            floorColor: '#cc9966',
            wallColor: '#006600',
            spawnRate: 6,
            text: "Status Unknown",
            style: "font-style: italic",
            bossDown: false,
            tiles: ReTiles16Outside,
            tilesf2: ReTiles16OutsideF2,
        }

        this.level3 = {
            level: 3,
            name: "Guardhouse",
            boss: "Brad Vickers",
            floorColor: '#cccc99',
            wallColor: '#330066',
            spawnRate: 4,
            text: "Status Unknown",
            style: "font-style: italic",
            bossDown: false,
            tiles: ReTiles16Guardhouse,
            tilesf2: ReTiles16GuardhouseF2,
        }

        this.level4 = {
            level: 4,
            name: "The Mansion",
            boss: "Albert Wesker",
            floorColor: '#6699cc',
            wallColor: '#660033',
            spawnRate: 5,
            text: "Status Unknown",
            style: "font-style: italic",
            bossDown: false,
            tiles: ReTiles16Mansion,
            tilesf2: ReTiles16MansionF2,
        }
    }
}