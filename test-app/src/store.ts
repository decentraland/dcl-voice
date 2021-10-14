import { applyMiddleware, compose, createStore } from 'redux'
import createSagasMiddleware from 'redux-saga'
import { createLogger } from 'redux-logger'

import { rootReducer } from './reducer'
import { rootSaga } from './sagas'

export function initStore() {
  const composeEnhancers =
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const sagasMiddleware = createSagasMiddleware()

  const loggerMiddleware = createLogger({
    collapsed: () => true,
    predicate: (_, _action) => true
  })

  const middleware = applyMiddleware(
    sagasMiddleware,
    loggerMiddleware,
  )

  const enhancer = composeEnhancers(middleware)
  const store = createStore(rootReducer, enhancer)

  sagasMiddleware.run(rootSaga())

  return store
}
