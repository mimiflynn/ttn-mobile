// @flow

import { createStore, applyMiddleware } from 'redux'

import logger from 'redux-logger'
import thunk from 'redux-thunk'

import configurePersist from './configurePersist'
import configureReducer from './configureReducer'

//@TODO exclude logging on provide
const middleware = [thunk, logger]

const enhancers = applyMiddleware(...middleware)

export default () => {
  const { persistRoot, persist, createPersistor } = configurePersist()
  const reducer = persistRoot(configureReducer(persist))

  const store = createStore(reducer, undefined, enhancers)
  const persistor = createPersistor(store)

  return { store, persistor }
}
