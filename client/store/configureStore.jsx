import {applyMiddleware, createStore} from 'redux'
import {createLogger} from 'redux-logger'
import reducer from './../reducers'
//import createSagaMiddleware, {END} from 'redux-saga'

//const sagaMiddleware = createSagaMiddleware()
const middleware = applyMiddleware(createLogger())
const store = createStore(reducer, middleware)
//store.runSaga = sagaMiddleware.run
store.close = () => store.dispatch(END)
export default store;
