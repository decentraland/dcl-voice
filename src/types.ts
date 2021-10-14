import { Client, RemoteStream, LocalStream } from './ion'
import { IonSFUJSONRPCSignal } from './ion/signal/json-rpc-impl'

export type VoiceState = {
  config: {
    url: string
    retryTimes: number
    pingInterval: number
  }
  error?: string
  connected: boolean
  client?: Client
  signal?: IonSFUJSONRPCSignal
  remoteStreams: RemoteStream[]
  localStream?: LocalStream
  reconnectTimes: number
}

export type RootVoiceState = {
  voice: VoiceState
}
