import { takeEvery } from 'redux-saga/effects'

import {
  ADD_REMOTE_STREAM,
  RECONNECT_VOICE,
  REMOVE_REMOTE_STREAM,
  START_LOCAL_STREAM,
  START_VOICE,
  JOIN_ROOM,
  SET_LOCAL_STREAM,
  SET_STREAM_POSITION,
  SET_LOCAL_POSITION,
  VOICE_INITIALIZED
} from '../actions'
import { joinRoom } from './joinRoom'
import { startVoiceSaga } from './signalConnection'
import { streamLocalVoice } from './localStream'
import { reconnectVoice } from './reconnect'
import { remoteStream } from './remoteStreams'
import { localStreamPosition, streamPosition } from './position'

export function* voiceSaga() {
  // Initalize sfu ws
  yield takeEvery(START_VOICE, startVoiceSaga)

  // Automatic join room after voice initialized.
  yield takeEvery(VOICE_INITIALIZED, joinRoom)

  // Leave current room and join the island room
  yield takeEvery(JOIN_ROOM, joinRoom)

  // Publish client stream
  yield takeEvery(START_LOCAL_STREAM, streamLocalVoice)

  // Reconnect voice signal
  yield takeEvery(RECONNECT_VOICE, reconnectVoice)

  // Start/Stop streams
  yield takeEvery(ADD_REMOTE_STREAM, remoteStream)
  yield takeEvery(REMOVE_REMOTE_STREAM, remoteStream)
  yield takeEvery(SET_LOCAL_STREAM, remoteStream)

  // Positional audio
  yield takeEvery(SET_STREAM_POSITION, streamPosition)
  yield takeEvery(SET_LOCAL_POSITION, localStreamPosition)
}
