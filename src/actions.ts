import { Client, RemoteStream, LocalStream } from './ion'
import { action } from 'typesafe-actions'
import { IonSFUJSONRPCSignal } from './ion/signal/json-rpc-impl'

import { VoiceState } from './types'

export const START_VOICE = 'Start Voice'
export const startVoice = (config?: Partial<VoiceState['config']>) =>
  action(START_VOICE, { config })
export type StartVoice = ReturnType<typeof startVoice>

export const VOICE_INITIALIZED = 'Voice Initialized'
export const voiceInitialized = (signal: IonSFUJSONRPCSignal, client: Client) =>
  action(VOICE_INITIALIZED, { client, signal })
export type VoiceInitialized = ReturnType<typeof voiceInitialized>

export const JOIN_ROOM = 'Join voice room'
export const joinRoom = (roomId: string, userId: string) =>
  action(JOIN_ROOM, { roomId, userId })
export type JoinRoom = ReturnType<typeof joinRoom>

export const SET_CONFIG = 'Voice set config'
export const setConfig = (config: Partial<VoiceState['config']>) =>
  action(SET_CONFIG, { config })
export type SetConfig = ReturnType<typeof setConfig>

export const SET_ERROR = 'Voice error'
export const setError = (error: string) => action(SET_ERROR, { error })
export type SetError = ReturnType<typeof setError>

export const RECONNECT_VOICE = 'Reconnect voice'
export const reconnectVoice = () => action(RECONNECT_VOICE)
export type ReconnectVoice = ReturnType<typeof reconnectVoice>

// MANAGE STREAMS
export const START_LOCAL_STREAM = 'Start local stream'
export const startLocalStream = () => action(START_LOCAL_STREAM)
export type StartLocalStream = ReturnType<typeof startLocalStream>

export const SET_LOCAL_STREAM = 'Set local stream'
export const setLocalStream = (stream: LocalStream) =>
  action(SET_LOCAL_STREAM, { stream })
export type SetLocalStream = ReturnType<typeof setLocalStream>

export const ADD_REMOTE_STREAM = 'Add remote stream'
export const addRemoteStream = (stream: RemoteStream) =>
  action(ADD_REMOTE_STREAM, { stream })
export type AddRemoteStream = ReturnType<typeof addRemoteStream>

export const REMOVE_REMOTE_STREAM = 'Remove remote stream'
export const removeRemoteStream = (streamId: string) =>
  action(REMOVE_REMOTE_STREAM, { streamId })
export type RemoveRemoteStream = ReturnType<typeof removeRemoteStream>

export type VoiceActions =
  | StartVoice
  | VoiceInitialized
  | SetConfig
  | SetError
  | ReconnectVoice
  | JoinRoom
  | SetLocalStream
  | AddRemoteStream
  | RemoveRemoteStream
  | StartLocalStream
