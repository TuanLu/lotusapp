import React from 'react'
import ReactDOM from 'react-dom'
import MainComponent from './components/MainComponent'
import {Provider} from 'react-redux'
import store from './store/configureStoreProduction'
import {bootstrapApp} from 'ISD_API'
import 'antd/dist/antd.css'
//import rootSaga from './sagas';
const rootEl = document.getElementById('isd_app')
ReactDOM.render(
  <Provider store={store}>
    <MainComponent/>
  </Provider>
  ,
  rootEl
);

