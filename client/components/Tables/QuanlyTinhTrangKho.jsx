import React from 'react'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject, trangThaiPhieu} from 'ISD_API'
import {updateStateData} from 'actions'
import TinhtrangSanpham from './QuanlyTinhTrangKho/TinhtrangSanpham'
import Tonghop from './QuanlyTinhTrangKho/Tonghop'

const trangThaiPhieuObj = convertArrayObjectToObject(trangThaiPhieu);

class QuanlyTinhTrangKho extends React.Component {
  constructor(props) {
    super(props);
  }
  isQC() {
    let {userRoles} = this.props.mainState;
    for(let i = 0; i < userRoles.length; i++) {
      if(userRoles[i].path == 'nhomqc') return true;
    }
    return false;
  }
  isQA() {
    let {userRoles} = this.props.mainState;
    for(let i = 0; i < userRoles.length; i++) {
      if(userRoles[i].path == 'nhomqa') return true;
    }
    return false;
  }
  componentDidMount() {

  }
  render() {
    return (
      <React.Fragment>
        <Tonghop
          isQA={this.isQA()}
          isQC={this.isQC()}
          dispatch={this.props.dispatch} 
          mainState={this.props.mainState}/>
        <TinhtrangSanpham
          isQA={this.isQA()}
          isQC={this.isQC()}
          dispatch={this.props.dispatch} 
          mainState={this.props.mainState}/>
      </React.Fragment>
    );
  }
}

export default QuanlyTinhTrangKho