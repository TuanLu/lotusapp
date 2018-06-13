import actionTypes from 'ACTION_TYPES'

export const startApp = (defaultProps) => ({type: actionTypes.START_APP, defaultProps});

/**
 * 
 * @param {object} updateData 
 */
export const updateStateData = (updateData) => ({
  type: actionTypes.UPDATE_STATE_DATA,
  updateData,
});