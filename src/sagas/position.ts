import { call, select } from 'redux-saga/effects'

import { SetLocalPosition, SetStreamPosition } from '../actions'
import { getContext, GetContext } from '../selectors'
import { updateStreamPosition, udpateLocalPosition } from '../position'

export function* streamPosition(action: SetStreamPosition) {
  const { streams }: GetContext = yield select(getContext)
  const stream = streams[action.payload.streamId]
  if (stream) {
    yield call(() => updateStreamPosition(stream, action.payload.position))
  }
}

export function* localStreamPosition(action: SetLocalPosition) {
  const { audioContext }: GetContext = yield select(getContext)
  if (audioContext) {
    yield call(() => udpateLocalPosition(audioContext, action.payload.position))
  }
}
