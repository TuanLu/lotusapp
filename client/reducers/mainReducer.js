import actionTypes from 'ACTION_TYPES'
import {cloneDeep} from 'lodash'


let _designDefault = {
    showLogin: true,
    defaultRouter: '',
    userRoles: [],
    categories: [],
    kho: [],
    products: []
  },
  cloneState;

export default (state = _designDefault, action) => {
  switch (action.type) {
    case actionTypes.START_APP:
      cloneState = cloneDeep(state);
      cloneState = {
        ...cloneState,
        ...action.defaultProps
      }
      return cloneState;
      break;
    case actionTypes.UPDATE_STATE_DATA:
      cloneState = cloneDeep(state);
      if(action.updateData && action.updateData.showLogin) {
        //Clean localStore
        sessionStorage.setItem('ISD_TOKEN', '');
      }
      cloneState = {
        ...cloneState,
        ...action.updateData
      }
      return cloneState;
      break;
  }
  return state;
}
