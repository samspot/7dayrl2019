
import { Ability, Bite, Charge, EmptySlot, Grab, GrenadeLauncher, Haymaker, Impale, Magnum, Poison, Shotgun, Suplex } from './abilities';
import Chimera from 'assets/chimera.json';
import Dog from 'assets/dog.json';
import Hunter from 'assets/hunter.json';
import Shark from 'assets/shark.json';
import Spider from 'assets/spider.json';
import Zombie from 'assets/zombie.json';

export class MobSpec {
    symbol: string;
    color: string;
    name: string;
    nickname: string;
    hp: number;
    score: number;
    str: number;
    sightRadius: number;
    bio: string;
    quote: string;
    speed: number

    getMobAbilities() {
        return abilities
    }

    getMobsByLevel() {
        return mobs
    }
}

const abilities: { [key: string]: Array<Object> } = {
    'Jill Valentine': [GrenadeLauncher, EmptySlot],
    'Chris Redfield': [Shotgun, EmptySlot],
    'Barry Burton': [Magnum, EmptySlot],
    'Brad Vickers': [Shotgun, EmptySlot],
    'Albert Wesker': [Magnum, EmptySlot],
    'Leon Kennedy': [Shotgun, Suplex],
    'Claire Redfield': [Bite, EmptySlot],
    'Ada Wong': [Bite, EmptySlot],
    'Rebecca Chambers': [GrenadeLauncher, EmptySlot],
    'William Birkin': [Impale, EmptySlot],
    'Hunk': [Shotgun, GrenadeLauncher],
    'Krauser': [Impale, Suplex],
    'Billy Coen': [Shotgun, EmptySlot],
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
    'catacombs': [Zombie, Hunter, Spider, Spider, Zombie, Zombie, Hunter, Spider], // SpiderBoss
    'outside': [Zombie, Dog, Dog, Spider],
    'guardhouse': [Zombie, Spider, Spider, Shark], // Plant, Plant42
    'mansion': [Zombie, Zombie, Hunter, Hunter], //Snake
}

