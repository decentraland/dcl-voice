import { Client } from 'ion-sdk-js'
import { IonSFUJSONRPCSignal } from 'ion-sdk-js/lib/signal/json-rpc-impl'
import { put, call, take, select } from 'redux-saga/effects'
import { EventChannel, eventChannel } from 'redux-saga'

import {
  voiceInitialized,
  addRemoteStream,
  removeRemoteStream,
  VoiceActions,
  reconnectVoice,
  setError
} from '../actions'
import { VoiceState } from '../types'
import { getConfig } from '../selectors'

type SignalConnection = Required<Pick<VoiceState, 'signal' | 'client'>>

function createSignalConnection(url: string) {
  return new Promise<SignalConnection>((resolve, reject) => {
    const signal = new IonSFUJSONRPCSignal(url)
    const client = new Client(signal)

    signal.onerror = (event) => {
      reject(event)
    }

    signal.onopen = function () {
      resolve({ signal, client })
    }
  })
}

function createSocketChannel({ client, signal }: SignalConnection, pingInterval: number) {
  return eventChannel<VoiceActions | Error>((emit) => {
    // Keep Alive functionality
    let interval: NodeJS.Timeout
    interval = setInterval(() => signal.notify('', ''), pingInterval)

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

export function* startVoiceSaga() {
  try {
    console.log('saga voice')
    const config: ReturnType<typeof getConfig> = yield select(getConfig)
    if (!config.url) {
      yield put(setError('ws url missing'))
      return
    }

    const { client, signal }: SignalConnection = yield call(
      createSignalConnection,
      config.url
    )
    const socketChannel: EventChannel<VoiceActions> = yield call(
      createSocketChannel,
      { client, signal },
      config.pingInterval
    )

    yield put(voiceInitialized(signal, client))

    while (true) {
      try {
        const payload: VoiceActions = yield take(socketChannel)
        yield put(payload)
      } catch (error) {
        // tslint:disable-next-line: no-console
        console.error('Channel error:', error)
        socketChannel.close()
        throw error
      }
    }
  } catch (error) {
    const errorMessage = (error as Error).message
    || (error as Error).name
    || error as string
    // tslint:disable-next-line: no-console
    console.error('Voice Saga:', error)
    yield put(setError(errorMessage))
    yield put(reconnectVoice())
  }
}
