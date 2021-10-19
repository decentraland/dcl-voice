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
  SET_LOCAL_POSITION
} from '../actions'
import { joinRoom } from './joinRoom'
import { startVoiceSaga } from './signalConnection'
import { streamLocalVoice } from './streamLocalVoice'
import { reconnectVoice } from './reconnectVoice'
import { voiceStream } from './voice-stream'
import { localStreamPosition, streamPosition } from './position'

export function* voiceSaga() {
  // Initalize sfu ws => call joinRoom to join default island.
  yield takeEvery(START_VOICE, startVoiceSaga)

  // Leave current room and join the island room
  yield takeEvery(JOIN_ROOM, joinRoom)

  // Publish client stream
  yield takeEvery(START_LOCAL_STREAM, streamLocalVoice)

  // Reconnect voice signal
  yield takeEvery(RECONNECT_VOICE, reconnectVoice)

  // Start/Stop streams
  yield takeEvery(ADD_REMOTE_STREAM, voiceStream)
  yield takeEvery(REMOVE_REMOTE_STREAM, voiceStream)
  yield takeEvery(SET_LOCAL_STREAM, voiceStream)

  // Positional audio
  yield takeEvery(SET_STREAM_POSITION, streamPosition)
  yield takeEvery(SET_LOCAL_POSITION, localStreamPosition)
}
