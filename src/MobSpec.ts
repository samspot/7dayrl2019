
import { Ability, Bite, Charge, EmptySlot, Grab, GrenadeLauncher, Haymaker, Impale, Magnum, Poison, Shotgun } from './abilities';
import Barry from 'assets/barry.json';
import Brad from 'assets/brad.json';
import Chimera from 'assets/chimera.json';
import Chris from 'assets/chris.json';
import Dog from 'assets/dog.json';
import Hunter from 'assets/hunter.json';
import Jill from 'assets/jill.json';
import Lisa from 'assets/lisa.json';
import Shark from 'assets/shark.json';
import Spider from 'assets/spider.json';
import Wesker from 'assets/wesker.json';
import Zombie from 'assets/zombie.json';

export class MobSpec {
    symbol: string;
    color: string;
    name: string;
    hp: number;
    score: number;
    str: number;
    sightRadius: number;
    bio: string;
    quote: string;

    getMobAbilities() {
        return abilities
    }

    getMobsByLevel() {
        return mobs
    }

    getBossesByLevel() {
        return bosses
    }
}

const abilities: { [key: string]: Array<Object> } = {
    'Jill Valentine': [GrenadeLauncher, EmptySlot],
    'Chris Redfield': [Shotgun, EmptySlot],
    'Barry Burton': [Magnum, EmptySlot],
    'Brad Vickers': [Shotgun, EmptySlot],
    'Albert Wesker': [Magnum, EmptySlot],
    'Tyrant': [Charge, Impale],
    'Zombie': [Grab],
    'Chimera': [Grab, Charge],
    'Dog': [Grab, Bite],
    'Hunter': [Bite, Charge],
    'Lisa Trevor': [Grab, Haymaker],
    'Plant': [Poison],
    'Plant 42': [Grab, Poison],
    'Shark': [Bite],
    'Snake Boss': [Bite, Poison],
    'Giant Spider': [Bite, Poison],
    'Black Tiger': [Bite, Poison, Charge]
}

const mobs = {
    'lab': [Zombie, Zombie, Chimera],
    'catacombs': [Zombie, Hunter, Spider, Spider, Zombie, Zombie, Hunter, Spider, Lisa], // SpiderBoss
    'outside': [Zombie, Dog, Dog, Spider],
    'guardhouse': [Zombie, Spider, Spider, Shark], // Plant, Plant42
    'mansion': [Zombie, Zombie, Hunter, Hunter], //Snake
}

const bosses = {
    'lab': Jill,
    'catacombs': Chris,
    'outside': Barry,
    'guardhouse': Brad,
    'mansion': Wesker
}

