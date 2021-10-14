import { AnyAction, Dispatch } from 'redux'
import { connect } from 'react-redux'

import {
  joinRoom,
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
    localStream: getLocalStream(state)
  }
}

const mapDispatch = (dispatch: Dispatch<AnyAction>): MapDispatchProps => ({
  onStartLocalStream: () => dispatch(startLocalStream()),
  onStartVoice: (config) => dispatch(startVoice(config)),
  onJoinRoom: (
    roomId: string, userId: string
  ) => dispatch(joinRoom(roomId, userId))
})

export default connect(mapState, mapDispatch)(App)
