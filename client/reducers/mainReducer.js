import actionTypes from 'ACTION_TYPES'
import {cloneDeep} from 'lodash'


let _designDefault = {
    showLogin: true,
    defaultRouter: '',
    userRoles: [],
    userlist: [],
    categories: [],
    kho: [],
    products: [],
    productsForExport: [],
    phieunhap: {
      nguoi_giao_dich: '',
      ma_kho: '',
      note: '',
      editNote: '',
      address: '',
      products: [],
      editingKey: '',
    },
    sx: {
      ma_sx: '',
      so: '',
      ma: '',
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
      tttb_kltb: '',
      note: '',
      pkhsx: '',
      pdbcl: '',
      gd: '',
      products: []
    },
    phieuAction: {
      addNewItem: false,
      action: 'view',//view, edit, cancel
    },
    kkvt: {
      ma_phieu: '',
      ma_kho: '',
      note: '',
      editNote: '',
      address: '',
      products: [],
      editingKey: '',
    },
    phieuxuat: {
      nguoi_giao_dich: '',
      ma_kho: '',
      note: '',
      editNote: '',
      address: '',
      products: [],
      editingKey: '',
    },
    phieuXuatAction: {
      addNewItem: false,
      action: 'view',//view, edit, cancel
      openModal: false
    },
    quyTrinhSx: {
      openModal: false,
      edit: {}
    },
    ganttData: {
      data:[],
	    links:[]
    },
    notes: [], 
    language: [], 
    ganttEvents: [],//Truoc khi reset phai dung gantt xoa di tat ca su kien da attach vao gantt
    quyTrinhTheoLenh: {
      showGantt: false
    },
    user: {
      openUserModal: false
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
      let resetStateBeforeSwitchNewTab;
      cloneState = cloneDeep(state);
      if(action.updateData && action.updateData.showLogin) {
        //Clean localStore
        sessionStorage.setItem('ISD_TOKEN', '');
      }
      //When user switch tab to another tab
      if(action.updateData && action.updateData.defaultRouter) {
        resetStateBeforeSwitchNewTab = {
          phieuAction: {
            ...cloneState.phieuAction,
            addNewItem: false,//Khi user dang edit, click vao tab khac thi se doi trang thai add/edit sang trang thai view
          },
          ganttData: _designDefault.ganttData,
          //ganttEvents: _designDefault.ganttEvents,// Khong nen reset o day, phai xoa events truoc
          quyTrinhSx: _designDefault.quyTrinhSx,
          quyTrinhTheoLenh: _designDefault.quyTrinhTheoLenh,
          phieunhap: _designDefault.phieunhap,
          phieuxuat: _designDefault.phieuxuat,
          phieuXuatAction: _designDefault.phieuXuatAction,
          productsForExport: _designDefault.productsForExport,
          sx: _designDefault.sx
        }
      }
      cloneState = {
        ...cloneState,
        ...resetStateBeforeSwitchNewTab,
        ...action.updateData
      }
      return cloneState;
      break;
  }
  return state;
}
