import * as ROT from 'rot-js'


// https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
export const keyMap = {};

keyMap[38] = 0;
keyMap[33] = 1;
keyMap[39] = 2;
keyMap[34] = 3;
keyMap[40] = 4;
keyMap[35] = 5;
keyMap[37] = 6;
keyMap[36] = 7;

keyMap[ROT.KEYS.VK_LEFT] = 6 // 37, left arrow
keyMap[ROT.KEYS.VK_H] = 6 // 37, left arrow

keyMap[ROT.KEYS.VK_UP] = 0; // up arrow
keyMap[ROT.KEYS.VK_K] = 0; // up arrow

keyMap[ROT.KEYS.VK_RIGHT] = 2; // right arrow
keyMap[ROT.KEYS.VK_L] = 2; // right arrow

keyMap[ROT.KEYS.VK_DOWN] = 4; // down arrow
keyMap[ROT.KEYS.VK_J] = 4; // down arrow 
