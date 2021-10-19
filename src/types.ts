import { Client, LocalStream, RemoteStream } from './ion'
import { IonSFUJSONRPCSignal } from './ion/signal/json-rpc-impl'

export type VoiceSpatialParams = {
  position: VoiceReadOnlyVector3
  orientation: VoiceReadOnlyVector3
}

export type RemoteStreamWithPanner = {
  panner: PannerNode
  gain: GainNode
  node: MediaStreamAudioSourceNode
  stream: RemoteStream
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
  remoteStreams: RemoteStream[]
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
