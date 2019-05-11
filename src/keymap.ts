// @ts-ignore
import { KEYS } from 'rot-js'


// https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes

interface IKeyMap {
    [key: string]: number
}

export const keyMap: IKeyMap = {}

keyMap[38] = 0;
keyMap[33] = 1;
keyMap[39] = 2;
keyMap[34] = 3;
keyMap[40] = 4;
keyMap[35] = 5;
keyMap[37] = 6;
keyMap[36] = 7;

keyMap[KEYS.VK_LEFT] = 6 // 37, left arrow
keyMap[KEYS.VK_H] = 6 // 37, left arrow
keyMap[KEYS.VK_A] = 6 // 37, left arrow

keyMap[KEYS.VK_UP] = 0; // up arrow
keyMap[KEYS.VK_K] = 0; // up arrow
keyMap[KEYS.VK_W] = 0; // up arrow

keyMap[KEYS.VK_RIGHT] = 2; // right arrow
keyMap[KEYS.VK_L] = 2; // right arrow
keyMap[KEYS.VK_D] = 2; // right arrow

keyMap[KEYS.VK_DOWN] = 4; // down arrow
keyMap[KEYS.VK_J] = 4; // down arrow 
keyMap[KEYS.VK_S] = 4; // down arrow 

export const numberKeys = [
    KEYS.VK_0,
    KEYS.VK_1,
    KEYS.VK_2,
    KEYS.VK_3,
    KEYS.VK_4,
    KEYS.VK_5,
    KEYS.VK_6,
    KEYS.VK_7,
    KEYS.VK_8,
    KEYS.VK_9
]

export function isEscKey(charCode: number) {
    return charCode === 27 || charCode === KEYS.VK_Q || charCode === KEYS.VK_E || charCode === KEYS.VK_R
}

export const abilitykeys = [
    KEYS.VK_Q,
    KEYS.VK_E,
    KEYS.VK_R
]