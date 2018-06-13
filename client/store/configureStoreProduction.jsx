import {createStore} from 'redux'
import reducer from './../reducers'
//import createSagaMiddleware, {END} from 'redux-saga'

//const sagaMiddleware = createSagaMiddleware()
//const middleware = applyMiddleware(sagaMiddleware)
const store = createStore(reducer)
//store.runSaga = sagaMiddleware.run
store.close = () => store.dispatch(END)
export default store;
