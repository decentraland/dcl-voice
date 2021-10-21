import { select, call, put } from 'redux-saga/effects'

import { getClient, getRoomId, getUserAddress } from '../selectors'
import {
  JoinRoom,
  startLocalStream,
  VoiceInitialized,
  JOIN_ROOM
} from '../actions'

export function* joinRoom(action: JoinRoom | VoiceInitialized) {
  const roomId: string =
    action.type === JOIN_ROOM
      ? action?.payload?.roomId
      : yield select(getRoomId)
  const client: ReturnType<typeof getClient> = yield select(getClient)
  const userAddress: ReturnType<typeof getUserAddress> = yield select(
    getUserAddress
  )

  if (!client || !roomId) return

  client.leave()
  // TODO: ok, this is not working. Leave doesn't leave at all
  // And joining a new room throws an error
  try {
    yield call(() => client.join(roomId, userAddress))

    // TODO: This shouldn't be here, but using it for testing purpose.
    yield put(startLocalStream())
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.log('Join Room error: ', e)
    client.close()
  }
}
