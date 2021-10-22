import { Client, LocalStream, RemoteStream } from './ion'
import { IonSFUJSONRPCSignal } from './ion/signal/json-rpc-impl'
import { Cache } from './utils'

export type VoiceSpatialParams = {
  position: [number, number, number]
  orientation: [number, number, number]
}

export type RemoteStreamWithPanner = {
  panner: PannerNode
  gain: GainNode
  node: MediaStreamAudioSourceNode
  stream: RemoteStream
}

export type VoiceState = {
  context: Readonly<Cache>
  config: {
    url: string
    retryTimes: number
    pingInterval: number
    userAddress: string
  }
  roomId?: string
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
