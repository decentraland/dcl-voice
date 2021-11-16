import { Client } from './../src/ion'
import { IonSFUJSONRPCSignal } from './../src/ion/signal/json-rpc-impl'
import { mockStream } from './mockStream'
import { listenDataChannel, setUser } from '../src/dataChannel'

const joins: Record<string, boolean> = {}

function totalConnected() {
  return Object.values(joins).filter((a) => !!a).length
}

export type Response = {
  silence: () => void
  noise: () => void
}

export function addConnection(id: string) {
  return new Promise<Response>((resolve) => {
    const signal = new IonSFUJSONRPCSignal(
      'wss://test-sfu.decentraland.zone/ws'
    )
    const client = new Client(signal)

    client.ondatachannel = ({ channel }) => {
      if (channel.label === 'data') {
        listenDataChannel(channel, 'onDataChannel')
      }
    }

    client.onspeaker = (spk) => {
      // console.log({ spk })
    }

    signal.onclose = async () => {
      console.log(`#${id} disconnected - total ${totalConnected()}`)
      joins[id] = false
    }

    signal.onopen = async () => {
      // Keep alive connetion
      setInterval(() => signal.notify('', ''), 1000 * 60)

      const roomId = process.env['ROOM'] || 'Room: Casla'
      await client.join(roomId, id)
      joins[id] = true
      console.log(`#${id} joined - total ${totalConnected()} - '${roomId}'`)

      // Create local media stream
      const { mediaStream, silence, noise } = mockStream()
      noise()

      client.publish(mediaStream as any)
      setUser({ id, streamId: mediaStream.id })

      setTimeout(() => silence(), 3000)
      // create a datachannel
      const dc = client.createDataChannel('data')
      listenDataChannel(dc, 'createDataChannel')
      resolve({ silence, noise })
    }
  })
}
