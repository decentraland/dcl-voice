import { Client, RemoteStream, LocalStream } from './ion'
import { IonSFUJSONRPCSignal } from './ion/signal/json-rpc-impl'

export type RemoteStreamWithPanner = RemoteStream & {
  panner?: PannerNode
  gain?: GainNode
}

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
  remoteStreams: RemoteStreamWithPanner[]
  localStream?: LocalStream
  reconnectTimes: number
}

export type VoiceReadOnlyVector3 = {
  readonly x: number
  readonly y: number
  readonly z: number
}

export type RootVoiceState = {
  voice: VoiceState
}
