import WebSocket from 'ws'
import { MediaStream, RTCPeerConnection } from 'wrtc'

;(globalThis as any).MediaStream = MediaStream
;(globalThis as any).RTCPeerConnection = RTCPeerConnection
;(globalThis as any).WebSocket = WebSocket

import { addConnection } from './connection'
addConnection(0)

// ;(async () => {
//   const maxPeer = 400

//   for (var i = 0; i < maxPeer; i++) {
//     addConnection(i)
//     await new Promise((resolve) => setTimeout(resolve, 100))
//   }
// })()
