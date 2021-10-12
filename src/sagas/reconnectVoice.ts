import { select, put, delay } from 'redux-saga/effects'

import { setError, startVoice } from '../actions'
import { getConfig, getReconnectTimes } from '../selectors'

const DEFAULT_TIMEOUT = 1000

export function* reconnectVoice() {
  const reconnectTimes: number = yield select(getReconnectTimes)
  const { retryTimes }: ReturnType<typeof getConfig> = yield select(getConfig)

  if (reconnectTimes > retryTimes) {
    // TODO: Do something when we cannot reconnect to the socket
    const error = 'Max amount of retries. Socket disconnected'
    yield put(setError(error))
    return
  }
  yield delay(DEFAULT_TIMEOUT * reconnectTimes)
  yield put(startVoice())
}
