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

(async () => {
  const maxPeer = 10

  const promises = Array
    .from({ length: maxPeer })
    .map((_, index) => addConnection(`${index}${Math.random()}`))

  await Promise.all(promises)

  setTimeout(
    () => console.log(cache['mapping']),
    1000 * 5
  )
})()
