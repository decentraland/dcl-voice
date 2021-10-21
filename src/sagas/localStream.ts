import { select, call, put } from 'redux-saga/effects'
import { Client, LocalStream, Constraints } from '../ion'

import { setLocalStream } from '../actions'
import { getClient, getUserAddress } from '../selectors'
import { listenDataChannel, setUser } from '../dataChannel'
import {
  createDestination,
  createContext,
  isChrome,
  createAudio
} from '../utils'
import { startLoopback } from '../loopback'

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
} as Constraints

// Add local stream muted to initialize AudioContext.
// Then we cache that AudioContext and append all the streams.
// Workaround for browsers that need a click in order to play some sound
export async function initVoiceContext(localStream: LocalStream) {
  const audioContext = createContext()
  const destination = createDestination(audioContext)
  const audio = createAudio()

  const stream = audioContext.createMediaStreamSource(localStream)
  const gain = audioContext.createGain()
  gain.gain.value = 0
  stream.connect(gain).connect(destination)

  const destinationStream = isChrome()
    ? await startLoopback(destination.stream)
    : destination.stream
  audio.srcObject = destinationStream
  await audio.play()
}

export function* streamLocalVoice() {
  const client: Client = yield select(getClient)
  const userAddress: ReturnType<typeof getUserAddress> = yield select(
    getUserAddress
  )
  const localStream: LocalStream = yield call(() =>
    LocalStream.getUserMedia(options)
  )

  // TODO: some questions
  // 1- what if we dont have userAddress for some reason?
  // 2- When we reconnect, we should set the store.context to the default value
  //    and create again the audioContext, destination, etc?
  // 3- Some question for the dataChannel
  setUser({ id: userAddress, streamId: localStream.id })

  // create AudioContext & AudioDestination
  yield call(() => initVoiceContext(localStream))
  yield call(() => client.publish(localStream))
  yield put(setLocalStream(localStream))

  const channel = client.createDataChannel('data')
  listenDataChannel(channel, 'localStream')
}
