import { select, call, put } from 'redux-saga/effects'
import { Client, LocalStream, Constraints } from '../ion'

import { setLocalStream } from '../actions'
import { getClient } from '../selectors'
import { initVoiceContext } from '..'
import { listenDataChannel, setUser } from '../dataChannel'

export function* streamLocalVoice() {
  const client: Client = yield select(getClient)
  const options = {
    resolution: 'hd',
    audio: true,
    codec: 'vp8',
    video: false,
    simulcast: true,
    sendEmptyOnMute: true,
    advanced: [{ echoCancellation: true }, { autoGainControl: true }, { noiseSuppression: true }]
  } as any as Constraints

  const localStream: LocalStream = yield call(() => LocalStream.getUserMedia(options))
  setUser({ id: window.location.search, streamId: localStream.id })
  initVoiceContext(localStream)

  yield call(() => client.publish(localStream))
  yield put(setLocalStream(localStream))

  const channel = client.createDataChannel('data')
  listenDataChannel(channel, 'create')
}
