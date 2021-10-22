import { action } from 'typesafe-actions'

import { setValue2, cache } from './utils'

// Messages that are sent via this channel.
// Every time we receive a join, we send a response saying who we are.
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

// Internal vars
let _user: User
let sendUserMessage: (() => void) | undefined

function validMessage(message: unknown): message is Message {
  const type = (message as any).type
  return type === RESPONSE || type === JOIN
}

export function setUser(user: User) {
  _user = user
}

// We have two listenDataChannel.
// 1- The first time the channel is created, called after joinRoom
//    this only happens once.
// 2- When we create the client/signal connection we listen to all the channels
//    already created. All the clients listen this way except the one who has
//    created the channel (1)
export function listenDataChannel(channel: RTCDataChannel, log: string) {
  // TODO what about channel closed ?
  // Should we disconnect/close the connection and create a new one ?
  // This is something to be aware of when we write the tests.
  if (sendUserMessage) {
    sendUserMessage()
    sendUserMessage = undefined
    // onDataChannel (2) listener will handle all the messages.
    return
  }

  channel.onerror = (error) => {
    console.error(log, { error })
  }

  channel.onclose = (close) => {
    console.error(log, { close })
  }

  channel.onmessage = ({ data }) => {
    const message: Message = JSON.parse(data)
    if (!_user || !validMessage(message)) return

    if (message.type === JOIN) {
      channel.send(JSON.stringify(response(_user)))
    }

    // Add usserAddress: streamId to our internal map
    setValue2('mapping', message.payload.id, message.payload.streamId)
    console.log(cache['mapping'])
  }

  channel.onopen = () => {
    // Sfu client only accepts ondatachannel to be initialized before joinRoom
    // And we dont have the streamId at that moment, so.......
    // We create a sendUserMessage that will be executed after getUserMedia is called
    const message = () => channel.send(JSON.stringify(join(_user)))

    if (!_user) {
      sendUserMessage = message
      return
    }

    message()
  }
}
