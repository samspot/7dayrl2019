import { Actor } from './actor';
export interface IMessage {
    msg: string;
    turn: number;
    important: boolean;
    source?: string;
    target?: string;
    actorSource?: Actor;
}
