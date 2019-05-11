import { RNG } from 'rot-js';

export function shuffle(array: Array<any>) {
    // @ts-ignore
    return RNG.shuffle(array)
}

export function getRandItem(array: Array<any>) {
    // @ts-ignore
    return RNG.getItem(array)
}