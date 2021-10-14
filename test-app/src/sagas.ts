import { all } from 'redux-saga/effects'
import { voiceSaga } from '@dcl/voice/dist/sagas'

export function rootSaga() {
  return function*() {
    yield all([voiceSaga()])
  }
}
