import { select, call, put } from 'redux-saga/effects'
import { Client, LocalStream, Constraints } from '../ion'

import { setLocalStream } from '../actions'
import { getClient } from '../selectors'
import { listenDataChannel, setUser } from '../dataChannel'
import { getAudio, getContext, getDestination, isChrome } from '../utils'
import { startLoopback } from '../loopback'

// Add local stream muted to initialize AudioContext.
// Then we cache that AudioContext and append all the streams.
// Workaround for browsers that need a click in order to play some sound
export async function initVoiceContext(localStream: LocalStream) {
  const context = getContext()
  const destination = getDestination()
  const audio = getAudio()

  const stream = context.createMediaStreamSource(localStream)
  const gain = context.createGain()
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
  } as any as Constraints

  const localStream: LocalStream = yield call(() =>
    LocalStream.getUserMedia(options)
  )
  setUser({ id: window.location.search, streamId: localStream.id })

  yield call(() => initVoiceContext(localStream))
  yield call(() => client.publish(localStream))
  yield put(setLocalStream(localStream))

  const channel = client.createDataChannel('data')
  listenDataChannel(channel, 'create')
}
