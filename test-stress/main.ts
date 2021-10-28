;(globalThis as any).MediaStream = require('wrtc').MediaStream
;(globalThis as any).RTCPeerConnection = require('wrtc').RTCPeerConnection
;(globalThis as any).WebSocket = require('ws')

// const { RTCAudioSource, RTCAudioSink } = require('wrtc').nonstandard;

// const source = new RTCAudioSource();
// const track = source.createTrack();
// const sink = new RTCAudioSink(track);

// const sampleRate = 8000;
// const samples = new Int16Array(sampleRate / 100);  // 10 ms of 16-bit mono audio

// samples.forEach((value, index) => {
//   samples[index] = Math.random() * 32768;
// })

// const data = {
//   samples,
//   sampleRate
// };

// const interval = setInterval(() => {
//   // Update audioData in some way before sending.
//   source.onData(data);
// });

// sink.ondata = data => {
//   // Do something with the received audio samples.
//   console.log('onData', data)
// };

// [constructor]
// interface RTCAudioSource {
//   MediaStreamTrack createTrack();
//   void onData(RTCAudioData data);
// };

// dictionary RTCAudioData {
//   required Int16Array samples;
//   required unsigned short sampleRate;
//   octet bitsPerSample = 16;
//   octet channelCount = 1;
//   unsigned short numberOfFrames;
// };

import { addConnection } from './connection'
addConnection(0)
// ;(async () => {
//   const maxPeer = 400

//   for (var i = 0; i < maxPeer; i++) {
//     addConnection(i)
//     await new Promise((resolve) => setTimeout(resolve, 100))
//   }
// })()
