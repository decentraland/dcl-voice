import { Stream } from 'stream'
import { Client, LocalStream } from './../src/ion'
import { IonSFUJSONRPCSignal } from './../src/ion/signal/json-rpc-impl'
// var uuid = require("uuid");

let signalConnected = 0
let dataChannelsConnected = 0
let clientJoined = 0
let joins: Record<string, boolean> = {}

export function addConnection(N: number) {
  return new Promise((resolve) => {
    const signal = new IonSFUJSONRPCSignal(
      'wss://test-sfu.decentraland.zone/ws'
    )
    const client = new Client(signal)

    signal.onclose = async () => {
      console.log(`#${N} disconnected - total ${signalConnected--}`)
      if (joins[N]) clientJoined--
    }

    signal.onopen = async () => {
      console.log(
        `#${N} connected - total ${signalConnected++}` // (joined ${clientJoined} - datachhanels ${dataChannelsConnected})`
      )

      setInterval(() => signal.notify('', ''), 1000 * 60)

      const u = Math.round(Math.random() * 100000).toString()
      await client.join('Room: Casla', u)
      clientJoined++
      console.log(`#${N} joined - total ${clientJoined}`)
      joins[N] = true
      const options = {
        resolution: 'hd',
        audio: true,
        codec: 'vp8',
        video: false,
        simulcast: true,
        sendEmptyOnMute: true,
        advanced: [
          { echoCancellation: true },
          { autoGainControl: true },
          { noiseSuppression: true }
        ]
      } as const

      const stream = new MediaStream()
      const mediaStream = new LocalStream(stream, options)

      const { RTCAudioSource } = require('wrtc').nonstandard

      const source = new RTCAudioSource()
      const track = source.createTrack()

      const sampleRate = 8000
      const samples = new Int16Array(sampleRate / 100) // 10 ms of 16-bit mono audio
      let t = 0.0;
      const possibleFrecuencies = [130,155,196,233, 329]
      const f = possibleFrecuencies[Math.round(Math.random() * (possibleFrecuencies.length-1))];

      const interval = setInterval(() => {
        samples.forEach((value, index) => {
          // Sin
          t+= 1/8000
          samples[index] = 1000 * Math.sin(2*3.1416*f*t) //*Math.round(Math.random() * 1000)

          // Noise
          // samples[index] = Math.round(Math.random() * 1000)
        })
          
        const data = {
          samples,
          sampleRate
        }

        source.onData(data)
      }, 10)

      mediaStream.addTrack(track)
      client.publish(mediaStream as any)

      // create a datachannel
      const dc = client.createDataChannel('data')
      dc.onopen = async () => {
        console.log(
          `#${N} data channel connected - total ${dataChannelsConnected++}`
        )

        while (1) {
          dc.send('TEST STRING')
          await new Promise((resolve) => setTimeout(resolve, 10))
        }
      }

      resolve(null)
    }
  })
}
