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
    return true;
    let {userInfo} = this.props.mainState;
    let roles = userInfo.roles ? userInfo.roles.split(',') : [];   
    return roles.indexOf('nhomqc') !== -1;
  }
  isQA() {
    return true;
    let {userInfo} = this.props.mainState;
    let roles = userInfo.roles ? userInfo.roles.split(',') : [];     
    return roles.indexOf('nhomqa') !== -1;
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