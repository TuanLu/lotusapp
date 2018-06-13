import React from 'react'
import { Icon } from 'antd';

export default class Loading extends React.Component {
  render() {
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)'
        }} 
        className="isd-app-loading">
        <Icon
          style={{ 
            fontSize: 46, 
            color: '#08c',
            width: '100%',
            ...this.props.style
          }} 
          type="loading"/>
       </div> 
    )    
  }
}