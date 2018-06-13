import actionTypes from 'ACTION_TYPES'

let _designDefault = {
  sidebar: {
    open: false,
    columnId: null
  },
  notify: {
    open: true,
    message: 'Hahah',
    header: 'Heheh',
    type: 'success',//negative,info,success
  },
  savePanel: {
    open: false
  },
  saveDesignNow: false,
}

export default (state = _designDefault, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_UI:
      return {
        ...state,
        ...action.updateData
      }
    case actionTypes.TOGGLE_SAVE:
      return {
        ...state,
        savePanel: {
          open: action.open
        }
      }
    case actionTypes.SAVE_DESIGN_NOW:
      return {
        ...state,
        saveDesignNow: action.confirm || false
      }
  }
  return state;
}
