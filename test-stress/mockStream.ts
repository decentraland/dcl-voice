import { LocalStream } from './../src/ion'

const options = {
  resolution: 'hd',
  audio: true,
  codec: 'vp8',
  video: false,
  simulcast: true,
  sendEmptyOnMute: true,
} as const

export function mockStream() {
  const stream = new MediaStream()
  const mediaStream = new LocalStream(stream, options)

  const { RTCAudioSource } = require('wrtc').nonstandard

  const source = new RTCAudioSource()
  const track = source.createTrack()

  const sampleRate = 8000
  const samples = new Int16Array(sampleRate / 100) // 10 ms of 16-bit mono audio
  let t = 0.0;
  const possibleFrecuencies = [130, 155, 196, 233, 329]
  const f = possibleFrecuencies[Math.round(Math.random() * (possibleFrecuencies.length - 1))];

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

  setInterval(() => {
    source.onData(data)
  })

  mediaStream.addTrack(track)
  return mediaStream
}