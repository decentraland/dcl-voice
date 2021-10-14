import { action } from 'typesafe-actions'

import { getValue, setValue2 } from './utils'

export const JOIN = 'JOIN_DATACHANNEL'
export const join = (user: User) => action(JOIN, user)
export type Join = ReturnType<typeof join>

export const RESPONSE = 'RESPONSE_DATACHANNEL'
export const response = (user: User) => action(RESPONSE, user)
export type Response = ReturnType<typeof response>

type Message = Response | Join
type User = {
  id: string
  streamId: string
}
let _user: User
let queue: (() => void) | undefined

function validMessage(message: unknown): message is Message {
  const type = (message as any).type
  return type === RESPONSE || type === JOIN
}

export function setUser(user: User) {
  _user = user
}

function addToMap(message: Message) {
  setValue2('mapping', message.payload.streamId, message.payload.id)
}

// We have two listenDataChannel.
// 1- The first time the channel is created, called after joinRoom
//    this only happens once.
// 2- When we create the client/signal connection we listen to all the channels
//    already created. All the clients listen this way except the one who has
//    created the channel (1)
export function listenDataChannel(channel: RTCDataChannel, log: string) {
  if (queue) {
    queue()
    // onDataChannel (2) listener will handle all the messages.
    return
  }

  channel.onmessage = ({ data }) => {
    const message: Message = JSON.parse(data)
    if (!_user || !validMessage(message)) return

    if (message.type === JOIN) {
      channel.send(JSON.stringify(response(_user)))
    }

    addToMap(message)
    console.log(log, getValue('mapping'))
  }

  channel.onopen = () => {
    // Sfu client only accepts ondatachannel to be initialized before joinRoom
    // And we dont have the streamId at that moment, so.......
    // We create a queue that will be executed after getUserMedia is called
    if (!_user) {
      queue = () => channel.send(JSON.stringify(join(_user)))
      return
    }

    channel.send(JSON.stringify(join(_user)))
  }
}
