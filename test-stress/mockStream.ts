import { LocalStream } from './../src/ion'

const options = {
  resolution: 'hd',
  audio: true,
  codec: 'vp8',
  video: false,
  simulcast: true,
  sendEmptyOnMute: true
} as const

export function mockStream() {
  const stream = new MediaStream()
  const mediaStream = new LocalStream(stream, options)

  const { RTCAudioSource } = require('wrtc').nonstandard

  const source = new RTCAudioSource()
  const track = source.createTrack()

  const sampleRate = 8000
  const samples = new Int16Array(sampleRate / 100) // 10 ms of 16-bit mono audio

  let t = 0.0
  const possibleFrecuencies = [130, 155, 196, 233, 329]
  const f =
    possibleFrecuencies[
      Math.round(Math.random() * (possibleFrecuencies.length - 1))
    ]

  let interval: NodeJS.Timeout

  const silence = () => {
    clearInterval(interval)

    samples.forEach((value, index) => {
      samples[index] = 0
    })

    const data = {
      samples,
      sampleRate
    }
    source.onData(data)
  }

  const noise = () => {
    samples.forEach((value, index) => {
      samples[index] = Math.round(Math.random() * 40000) - 20000
    })

    interval = setInterval(() => {
      const data = {
        samples,
        sampleRate
      }
      source.onData(data)
    }, 10)
  }

  mediaStream.addTrack(track)
  return {
    mediaStream,
    silence,
    noise
  }
}
