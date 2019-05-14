import { VK_0, VK_1, VK_2, VK_3, VK_4, VK_5, VK_6, VK_7, VK_8, VK_9 } from "rot-js";
import { VK_H, VK_A, VK_K, VK_W, VK_L, VK_D, VK_J, VK_S } from "rot-js";
import { VK_LEFT, VK_UP, VK_RIGHT, VK_DOWN } from "rot-js";
import { VK_Q, VK_E, VK_R } from "rot-js";

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

keyMap[VK_LEFT] = 6 // 37, left arrow
keyMap[VK_H] = 6 // 37, left arrow
keyMap[VK_A] = 6 // 37, left arrow

keyMap[VK_UP] = 0; // up arrow
keyMap[VK_K] = 0; // up arrow
keyMap[VK_W] = 0; // up arrow

keyMap[VK_RIGHT] = 2; // right arrow
keyMap[VK_L] = 2; // right arrow
keyMap[VK_D] = 2; // right arrow

keyMap[VK_DOWN] = 4; // down arrow
keyMap[VK_J] = 4; // down arrow 
keyMap[VK_S] = 4; // down arrow 

export const numberKeys = [
    VK_0,
    VK_1,
    VK_2,
    VK_3,
    VK_4,
    VK_5,
    VK_6,
    VK_7,
    VK_8,
    VK_9
]

export function isEscKey(charCode: number) {
    return charCode === 27 || charCode === VK_Q || charCode === VK_E || charCode === VK_R
}

export const abilitykeys = [
    VK_Q,
    VK_E,
    VK_R
]