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

import { addConnection, Response } from './connection'

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

;(async () => {
  const peers: Response[] = []
  const maxPeer = 20
  const connectionPromises = Array.from({ length: maxPeer }).map(
    (_, index) => () => addConnection(`${index}${Math.random()}`)
  )

  for (const promise of connectionPromises) {
    // to avoid sending all the connections at the same time.
    await sleep(Math.random() * 500)
    promise().then(p => peers.push(p))
  }

  let talkingIndex = 0

  while (true) {
    console.log(`Talking #${talkingIndex}/${peers.length}`)
    peers[talkingIndex]?.silence()
    await sleep(300)
    talkingIndex = (talkingIndex + 1) % peers.length || 0
    peers[talkingIndex]?.noise()
    await sleep(2000)
  }
})()
