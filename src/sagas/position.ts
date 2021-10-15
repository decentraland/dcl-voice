import { select } from 'redux-saga/effects'

import { SetLocalPosition, SetStreamPosition } from '../actions'
import { getRemoteStreams } from '../selectors'
import { RemoteStreamWithPanner } from '../types'
import { getContext } from '../utils'

export function* streamPosition(action: SetStreamPosition) {
  const streams: RemoteStreamWithPanner[] = yield select(getRemoteStreams)

  for (const stream of streams) {
    if (stream.id == action.payload.streamId && stream.panner) {
      // even thouth setPosition and setOrientation are deprecated, that
      // is the only way to set positions in Firefox and Safari
      const { x, y, z } = action.payload.position
      stream.panner.setPosition(x, y, z)
      stream.panner.setOrientation(
        action.payload.position.x,
        action.payload.position.y,
        action.payload.position.z
      )
      break
    }
  }
}

export function* localStreamPosition(action: SetLocalPosition) {
  const context: AudioContext = yield select(getContext)

  // even thouth setPosition and setOrientation are deprecated, that
  // is the only way to set positions in Firefox and Safari
  const { x, y, z } = action.payload.position
  context.listener.setPosition(x, y, z)
  context.listener.setOrientation(
    action.payload.position.x,
    action.payload.position.y,
    action.payload.position.z,
    0,
    1,
    0
  )
}
