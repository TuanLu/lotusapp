import actionTypes from 'ACTION_TYPES'
import {cloneDeep} from 'lodash'


let _designDefault = {
    showLogin: true,
    defaultRouter: '',
    userRoles: [],
    categories: [],
    kho: [],
    products: [],
    phieunhap: {
      nguoi_giao_dich: '',
      ma_kho: '',
      note: '',
      address: '',
      products: [],
      editingKey: '',
    },
    sx: {
      ma_sx: '',
			so: '',
			cong_doan: '',
			ma_sp: '',
			co_lo: '',
			so_lo: '',
			nsx: '',
			hd: '',
			so_dk: '',
			dang_bao_che: '',
			qcdg: '',
			dh: '',
			tttb_kltb: ''
    },
    phieuAction: {
      addNewItem: false,
      action: 'view',//view, edit, cancel
    }
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
