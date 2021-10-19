import { AnyAction, Dispatch } from 'redux'
import { connect } from 'react-redux'

import {
  joinRoom,
  setLocalPosition,
  setStreamPosition,
  startLocalStream,
  startVoice,
} from '@dcl/voice/dist/actions'
import {
  getRemoteStreams,
  getLocalStream,
  getConnected
} from '@dcl/voice/dist/selectors'

import { RootState } from '../types'
import { MapStateProps, MapDispatchProps } from './App.types'
import App from './App'

const mapState = (state: RootState): MapStateProps => {
  return {
    connected: getConnected(state),
    remoteStreams: getRemoteStreams(state),
    localStream: getLocalStream(state),
  }
}

const mapDispatch = (dispatch: Dispatch<AnyAction>): MapDispatchProps => ({
  onStartLocalStream: () => dispatch(startLocalStream()),
  onStartVoice: (config) => dispatch(startVoice(config)),
  onJoinRoom: (roomId, userId) => dispatch(joinRoom(roomId, userId)),
  onSetLocalPosition: (position, _pos) => dispatch(setLocalPosition(position, position)),
  onSetStreamPosition: (streamId, position) => dispatch(setStreamPosition(streamId, position))
})

export default connect(mapState, mapDispatch)(App)
