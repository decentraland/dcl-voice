import { select, call } from 'redux-saga/effects'
import { RemoteStream } from '../ion'

import { AddRemoteStream, RemoveRemoteStream, REMOVE_REMOTE_STREAM, SetLocalStream } from '../actions'
import { getRemoteStreams } from '../selectors'
import { addVoiceStream, removeVoiceStream } from '../'
import { isContextDefined } from '../utils'

type Action = AddRemoteStream | RemoveRemoteStream | SetLocalStream
export function* voiceStream(action: Action) {
  if (!isContextDefined()) {
    return
  }

  if (action.type === REMOVE_REMOTE_STREAM) {
    yield call(() => removeVoiceStream(action.payload.streamId))
    return
  }

  const remoteStreams: RemoteStream[] = yield select(getRemoteStreams)
  yield call(() => addVoiceStream(remoteStreams))
}
