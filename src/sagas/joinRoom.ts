import { select, call, put } from 'redux-saga/effects'

import { getClient } from '../selectors'
import { JoinRoom, startLocalStream } from '../actions'

// What about the selectors that we need?
export function* joinRoom(action: JoinRoom) {
  const { userId, roomId } = action.payload
  const client: ReturnType<typeof getClient> = yield select(getClient)

  if (!client || !roomId || !userId) return

  client.leave()
  // TODO: ok, this is not working. Leave doesn't leave at all
  // And joining a new room throws an error
  try {
    yield call(() => client.join(roomId, userId))

    // TODO: This shouldn't be here, but using it for testing purpose.
    yield put(startLocalStream())
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.log('Join Room error: ', e)
    client.close()
  }
}
