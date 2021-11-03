import WebSocket from 'ws'
import { MediaStream, RTCPeerConnection } from 'wrtc'

// Mocking global vars that ion-sfu uses.
;(globalThis as any).window = {
  AudioContext: () => {}
}
;(globalThis as any).MediaStream = MediaStream
;(globalThis as any).RTCPeerConnection = RTCPeerConnection
;(globalThis as any).WebSocket = WebSocket
;(globalThis as any).RTCRtpSender = {
  getCapabilities: (...args: any) => {}
}
// End of mocking

import { addConnection } from './connection'
import { cache } from '../src/utils'
;(async () => {
  const maxPeer = 10

  const promises = Array.from({ length: maxPeer }).map(
    (_, index) => () => addConnection(`${index}${Math.random()}`)
  )

  let promisesPeers: Promise<any>[] = []
  for (const p of promises) {
    promisesPeers.push(p())
    // await new Promise((resolve) => setTimeout(resolve, 100))
  }

  const peers = await Promise.all(promisesPeers)
  console.log({peers})
  let talkingIndex = 0
  const talk = async () => {
    console.log({ talkingIndex })
    peers[talkingIndex].silence()
    await new Promise((resolve) => setTimeout(resolve, 500))
    talkingIndex = (talkingIndex + 1) % maxPeer
    peers[talkingIndex].noise()
    setTimeout(talk, 2000)
  }
  talk()

  setTimeout(() => console.log(cache['mapping']), 1000 * 5)
})()
