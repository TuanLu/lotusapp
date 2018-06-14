import React from 'react'
import {connect} from 'react-redux'
import FormThongTin from './FormThongtin'
import FormSanpham from './FormSanpham'

class FormPhieunhap extends React.Component {

  render() {
    return (
      <div>
        <FormThongTin 
          dispatch={this.props.dispatch} 
          mainState={this.props.mainState}/>
        <FormSanpham
          dispatch={this.props.dispatch} 
          mainState={this.props.mainState}/>
      </div>
      
    );
  }
}

export default connect((state) => {
  return {  
    mainState: state.main.present
  }
})(FormPhieunhap)