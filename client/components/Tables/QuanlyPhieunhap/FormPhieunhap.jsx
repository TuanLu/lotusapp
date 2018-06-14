import React from 'react'
import FormThongTin from './FormThongtin'

class FormPhieunhap extends React.Component {

  render() {
    return (
      <div>
        <FormThongTin 
          onCancel={this.props.onCancel}
          dispatch={this.props.dispatch} 
          mainState={this.props.mainState}/>
      </div>
      
    );
  }
}

export default FormPhieunhap