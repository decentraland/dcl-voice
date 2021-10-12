import { Client } from 'ion-sdk-js'
import { IonSFUJSONRPCSignal } from 'ion-sdk-js/lib/signal/json-rpc-impl'
import { put, call, take } from 'redux-saga/effects'
import { EventChannel, eventChannel } from 'redux-saga'

import {
  voiceInitialized,
  addRemoteStream,
  removeRemoteStream,
  VoiceActions,
  reconnectVoice
} from '../actions'
import { VoiceState } from '../types'

type SignalConnection = Required<Pick<VoiceState, 'signal' | 'client'>>

// TODO remove constants
const ONE_MIMNUTE = 1000 * 60
const URL = 'wss://test-sfu.decentraland.zone/ws'

function createSignalConnection() {
  return new Promise<SignalConnection>((resolve, reject) => {
    const signal = new IonSFUJSONRPCSignal(URL)
    const client = new Client(signal)

    signal.onerror = (event) => {
      reject(event)
    }

    signal.onopen = function () {
      resolve({ signal, client })
    }
  })
}

function createSocketChannel({ client, signal }: SignalConnection) {
  return eventChannel<VoiceActions | Error>((emit) => {
    // Keep Alive functionality
    let interval: NodeJS.Timeout
    interval = setInterval(() => signal.notify('', ''), ONE_MIMNUTE)

    // Read remote streams
    client.ontrack = (track, stream) => {
      console.log({ track, stream })
      track.onunmute = () => {
        // Send to th socketChannel ADD_REMOTE_STREAM action
        emit(addRemoteStream(stream))

        stream.onremovetrack = () => {
          // Some stream close the channel
          // Send to th socketChannel REMOVE_REMOTE_STREAM action
          emit(removeRemoteStream(stream.id))
        }
      }
    }

    // If signal closes, then throw a new error.
    // The try/catch wrapper would do the reconnect workflow
    signal.onclose = (event) => {
      emit(new Error(event.type))
    }

    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      window.clearInterval(interval)
      try {
        client.close()
      } catch (e) {
        // just in case we didn't close the client/signal
      }
    }

    return unsubscribe
  })
}

export function* initializeVoiceSaga() {
  try {
    const { client, signal }: SignalConnection = yield call(
      createSignalConnection
    )
    const socketChannel: EventChannel<VoiceActions> = yield call(
      createSocketChannel,
      { client, signal }
    )

    yield put(voiceInitialized(signal, client))

    while (true) {
      try {
        const payload: VoiceActions = yield take(socketChannel)
        console.log({ payload })
        yield put(payload)
      } catch (error) {
        // tslint:disable-next-line: no-console
        console.log('Channel error:', error)
        socketChannel.close()
        throw error
      }
    }
  } catch (error) {
    // tslint:disable-next-line: no-console
    console.log('Voice Saga:', error)
    yield put(reconnectVoice())
  }
}
