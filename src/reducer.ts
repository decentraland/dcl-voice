import { VoiceState } from './types'
import {
  ADD_REMOTE_STREAM,
  RECONNECT_VOICE,
  REMOVE_REMOTE_STREAM,
  SET_CONFIG,
  SET_ERROR,
  SET_LOCAL_STREAM,
  START_VOICE,
  VoiceActions,
  VOICE_INITIALIZED
} from './actions'

const VOICE_INITIAL_STATE: VoiceState = {
  config: {
    pingInterval: 1000 * 60,
    retryTimes: 10,
    url: ''
  },
  connected: false,
  remoteStreams: [],
  localStream: undefined,
  reconnectTimes: 0
}

type State = VoiceState

export function voiceReducer(
  state: VoiceState = VOICE_INITIAL_STATE,
  action: VoiceActions
): State {
  switch (action.type) {
    case VOICE_INITIALIZED: {
      return {
        ...state,
        client: action.payload.client,
        signal: action.payload.signal,
        connected: true,
        reconnectTimes: 0,
        remoteStreams: [],
        error: undefined
      }
    }

    case START_VOICE: {
      return {
        ...state,
        config: { ...state.config, ...action.payload.config }
      }
    }

    case RECONNECT_VOICE: {
      return {
        ...state,
        reconnectTimes: state.reconnectTimes + 1
      }
    }

    case SET_CONFIG: {
      return {
        ...state,
        config: { ...state.config, ...action.payload.config }
      }
    }

    case SET_ERROR: {
      console.error(action.payload.error)
      return {
        ...state,
        error: action.payload.error
      }
    }

    case ADD_REMOTE_STREAM: {
      const { stream } = action.payload
      if (state.remoteStreams.find((s) => s.id === stream.id)) {
        return {
          ...state,
          remoteStreams: state.remoteStreams.map((s) =>
            s.id === stream.id ? stream : s
          )
        }
      }

      return {
        ...state,
        remoteStreams: state.remoteStreams.concat(stream)
      }
    }

    case REMOVE_REMOTE_STREAM: {
      return {
        ...state,
        remoteStreams: state.remoteStreams.filter(
          (stream) => stream.id !== action.payload.streamId
        )
      }
    }

    case SET_LOCAL_STREAM: {
      return {
        ...state,
        localStream: action.payload.stream
      }
    }
  }

  return state
}
