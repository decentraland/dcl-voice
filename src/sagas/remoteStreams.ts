import { select, call } from 'redux-saga/effects'
import { RemoteStream } from '../ion'

import {
  AddRemoteStream,
  RemoveRemoteStream,
  REMOVE_REMOTE_STREAM,
  SetLocalStream
} from '../actions'
import { getContext, getRemoteStreams, GetContext } from '../selectors'

import { addVoiceStream, removeVoiceStream } from '../audioContext'

type Action = AddRemoteStream | RemoveRemoteStream | SetLocalStream

export function* remoteStream(action: Action) {
  const context: GetContext = yield select(getContext)
  if (!context.audioContext) {
    return
  }

  if (action.type === REMOVE_REMOTE_STREAM) {
    yield call(() => removeVoiceStream(context, action.payload.streamId))
    return
  }

  const remoteStreams: RemoteStream[] = yield select(getRemoteStreams)
  yield call(() => addVoiceStream(context, remoteStreams))
}
