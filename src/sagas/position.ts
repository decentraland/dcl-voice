import { call, select } from 'redux-saga/effects'

import { SetLocalPosition, SetStreamPosition } from '../actions'
import { getContext, GetContext } from '../selectors'
import { updateStreamPosition, udpateLocalPosition } from '../position'

export function* streamPosition(action: SetStreamPosition) {
  const { streams }: GetContext = yield select(getContext)
  const stream = streams[action.payload.streamId]
  const { position } = action.payload
  if (stream) {
    yield call(() => updateStreamPosition(stream, position, position))
  }
}

export function* localStreamPosition(action: SetLocalPosition) {
  const { audioContext }: GetContext = yield select(getContext)
  const { position } = action.payload
  if (audioContext) {
    yield call(() => udpateLocalPosition(position, position))
  }
}
