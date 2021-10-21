import { VoiceState } from './types'
import {
  ADD_REMOTE_STREAM,
  JOIN_ROOM,
  RECONNECT_VOICE,
  REMOVE_REMOTE_STREAM,
  SET_CONTEXT,
  SET_ERROR,
  SET_LOCAL_STREAM,
  START_VOICE,
  VoiceActions,
  VOICE_INITIALIZED
} from './actions'
import { DEFAULT_CACHE as DEFAULT_CONTEXT } from './utils'

const VOICE_INITIAL_STATE: VoiceState = {
  context: DEFAULT_CONTEXT,
  config: {
    pingInterval: 1000 * 60,
    retryTimes: 10,
    url: '',
    userAddress: ''
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
        // Reset values on reconnect.
        client: action.payload.client,
        signal: action.payload.signal,
        connected: true,
        reconnectTimes: 0,
        remoteStreams: [],
        error: undefined
      }
    }

    case JOIN_ROOM: {
      return {
        ...state,
        roomId: action.payload.roomId
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

    case SET_CONTEXT: {
      return {
        ...state,
        context: { ...state.context, ...action.payload.context }
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
