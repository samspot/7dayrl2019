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

    getUiList() {
        let allmessages = this.getMessages()

        let list: any = allmessages.map((msg, turn) => {
            // let test = m.map(x => x.msg).join("|")
            // console.log(test)
            return msg.map((m, idx) => {
                // m.idx = idx

                let message = <any>_.clone(m)
                // message.idx = idx

                let source = message.dmgDealerName
                let target = message.targetName

                let text = message.attackName
                if (source || target) {
                    // text = `${target} receives ${message.attackName} [Source: ${source}] HP ${message.hpBefore}=>${message.hpAfter}`
                    text = `${text} ${message.dmg} dmg to ${target} [Source: ${source}] HP ${message.hpBefore}=>${message.hpAfter}`
                }
                message.msg = text
                message.turns = turn
                message.recent = turn >= this.turns
                // console.log(message)
                return message
            })

        })

        // console.log('2list before react', messager.turns, list)
        list = list.map((m: any) => {
            // console.log('m', m)
            let msg = m[0].turns + '] ' + m.map((x: any) => x.msg).join('|')
            return {
                msg: msg,
                recent: m[0].recent,
                important: m[0].important
            }
        })
        // console.log('list before react', messager.turns, list)
        let sorted: any = []
        list.forEach((m: any) => {
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