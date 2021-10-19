import { select } from 'redux-saga/effects'

import { SetLocalPosition, SetStreamPosition } from '../actions'
import { RemoteStreamWithPanner } from '../types'
import { getContext, getValue } from '../utils'

type Streams = Record<string, RemoteStreamWithPanner>

export function* streamPosition(action: SetStreamPosition) {
  const streams: Streams = yield select(() => getValue('streams'))
  const stream = streams[action.payload.streamId]

  if (stream.panner) {
    // even thouth setPosition and setOrientation are deprecated, that
    // is the only way to set positions in Firefox and Safari
    const { x, y, z } = action.payload.position
    stream.panner.setPosition(x, y, z)
    stream.panner.setOrientation(
      action.payload.position.x,
      action.payload.position.y,
      action.payload.position.z
    )
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
