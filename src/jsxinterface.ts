import { Player } from "./player";
import { Actor } from "./actor";
import { Ability } from "./abilities";
import { Game } from "./game";

export interface IPropsGame {
    game: Game
}

export interface IPropsAbility {
    ability: Ability
}

export interface IPropsActor {
    actor: Actor
}

export interface IPropsPlayer {
    player: Player
}
