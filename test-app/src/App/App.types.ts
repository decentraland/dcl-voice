import { startVoice, joinRoom, startLocalStream, setLocalPosition, setStreamPosition } from '@dcl/voice/dist/actions'
import { LocalStream, RemoteStream } from '@dcl/voice/dist/ion'

export type Props = {
  connected: boolean
  localStream?: LocalStream
  remoteStreams: RemoteStream[]
  onStartVoice: typeof startVoice
  onStartLocalStream: typeof startLocalStream
  onJoinRoom: typeof joinRoom
  onSetLocalPosition: typeof setLocalPosition
  onSetStreamPosition: typeof setStreamPosition
}

export type MapStateProps = Pick<
  Props,
  | 'connected'
  | 'localStream'
  | 'remoteStreams'
>

export type MapDispatchProps = Pick<
  Props,
  | 'onStartVoice'
  | 'onJoinRoom'
  | 'onStartLocalStream'
  | 'onSetLocalPosition'
  | 'onSetStreamPosition'
>
