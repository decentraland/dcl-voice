import { RootVoiceState } from './types'

export const getClient = (store: RootVoiceState) => store.voice.client

export const getReconnectTimes = (store: RootVoiceState) =>
  store.voice.reconnectTimes

export const getRemoteStreams = (store: RootVoiceState) =>
  store.voice.remoteStreams

export const getLocalStream = (store: RootVoiceState) => store.voice.localStream

export const getConnected = (store: RootVoiceState) => store.voice.connected

export const getConfig = (store: RootVoiceState) => store.voice.config
