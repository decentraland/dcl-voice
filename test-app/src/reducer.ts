import { combineReducers } from 'redux'
import { voiceReducer } from '@dcl/voice/dist/reducer'

export const rootReducer = combineReducers({
  voice: voiceReducer
})
