import React from 'react'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject, trangThaiPhieu} from 'ISD_API'
import {updateStateData} from 'actions'
import TinhtrangSanpham from './QuanlyKehoachvattu/TinhtrangSanpham'
import Tonghop from './QuanlyKehoachvattu/Tonghop'

const trangThaiPhieuObj = convertArrayObjectToObject(trangThaiPhieu);

class QuanlyKehoachvattu extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {

  }
  render() {
    return (
      <React.Fragment>
        <Tonghop
          dispatch={this.props.dispatch} 
          mainState={this.props.mainState}/>
        <TinhtrangSanpham
          dispatch={this.props.dispatch} 
          mainState={this.props.mainState}/>
      </React.Fragment>
    );
  }
}

export default QuanlyKehoachvattu