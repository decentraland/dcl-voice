import { Reducer, Store } from 'redux'
import { VoiceState } from '@dcl/voice/dist/types'

export type RootState = {
  voice: VoiceState
}

export type RootReducer = Reducer<Store<RootState>>
