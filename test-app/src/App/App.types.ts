import { startVoice, joinRoom, startLocalStream } from '@dcl/voice/dist/actions'
import { LocalStream, RemoteStream } from '@dcl/ion-sdk-js'

export type Props = {
  connected: boolean
  localStream?: LocalStream
  remoteStreams: RemoteStream[]
  onStartVoice: typeof startVoice
  onStartLocalStream: typeof startLocalStream
  onJoinRoom: typeof joinRoom
}

export type MapStateProps = Pick<
  Props,
  | 'connected'
  | 'localStream'
  | 'remoteStreams'
>

export type MapDispatchProps = Pick<Props, 'onStartVoice' | 'onJoinRoom' | 'onStartLocalStream'>
