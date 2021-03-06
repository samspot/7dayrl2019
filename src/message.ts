import { Actor } from './actor'
import * as _ from 'lodash'

export interface IMessage {
    attackName: string
    dmg?: number
    important: boolean
    dmgDealerName?: string
    targetName?: string
    dmgDealer?: Actor
    hpBefore?: number
    hpAfter?: number
    turn: number
}

export interface IUiMessageElement {
    msg: string
    recent: boolean
    important: boolean
    playerhit: boolean
    turns: number
}

export class Messager {
    messages: Array<IMessage>
    turns: number
    constructor() {
        this.messages = []
        this.turns = 0
    }

    update() {
        this.turns++
    }

    getMessages() {
        let output: Array<Array<IMessage>> = []
        // return this.messages
        this.messages.forEach(m => {
            output[m.turn] = output[m.turn] ? output[m.turn] : []
            output[m.turn].push(m)
        })
        return output
    }

    getUiList(): Array<Array<IUiMessageElement>> {
        let allmessages = this.getMessages()

        let list: Array<Array<IUiMessageElement>> = allmessages.map((msg, turn) => {
            // let test = m.map(x => x.msg).join("|")
            // console.log(test)
            let messages = msg.map((m, idx) => {
                // m.idx = idx

                let message = <any>_.clone(m)
                // message.idx = idx

                let source = message.dmgDealerName
                let target = message.targetName

                let text = message.attackName
                if (source || target) {
                    // text = `${target} receives ${message.attackName} [Source: ${source}] HP ${message.hpBefore}=>${message.hpAfter}`

                    // if (Config.debug) {
                    if (source === 'Player') {

                        text = `You did ${message.dmg} damage to ${target} (${text}), `
                    }
                    if (source !== 'Player') {
                        text = `You took ${message.dmg} damage from ${source}'s ${text}, `
                    }
                    // } else {
                    // text = `${text} ${message.dmg} dmg to ${target} HP ${message.hpBefore}=>${message.hpAfter} [Source: ${source}] `
                    // }
                }
                message.msg = text
                message.turns = turn
                message.recent = turn >= this.turns
                message.playerhit = target === 'Player'
                // console.log(message)
                return message
            })

            messages = messages.filter(m => {
                let isDamageMessage = !m.dmgDealerName && !m.targetName
                let isVsPlayer = m.dmgDealerName === 'Player' || m.targetName === 'Player'
                return isDamageMessage || isVsPlayer
            })

            return messages

        })

        list = list.filter((x) => x.length > 0)

        let sorted: Array<Array<IUiMessageElement>> = []
        list.forEach((m: Array<IUiMessageElement>) => {
            sorted.unshift(m)
        })
        return sorted
    }

    message(msg: string, important?: boolean) {
        let message = {
            attackName: msg,
            turn: this.turns,
            important: important
        }
        this.messages.unshift(message)
    }

    dmgMessage(attackName: string, dmg: number, important: boolean, dmgDealerName: string, targetName: string, dmgDealer: Actor, hpBefore: number, hpAfter: number) {
        // console.log('msg', msg)
        let message: IMessage = {
            attackName,
            dmg,
            important,
            dmgDealerName,
            targetName,
            dmgDealer,
            hpBefore,
            hpAfter,
            turn: this.turns
        }
        // console.log('printing msg', message.msg)
        this.messages.unshift(message)
    }

}