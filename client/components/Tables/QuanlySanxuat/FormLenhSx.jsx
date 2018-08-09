import React from 'react'
import {connect} from 'react-redux'
import FormThongTin from './FormThongtin'
import FormSanpham from './FormSanpham'
import FormNote from './FormNote'
import Gantt from './../QuanlyQuytrinhSanxuat/Gantt'
import { Row, Button, Col, Popconfirm, message, Select } from 'antd';
import {getTokenHeader, blankGanttData} from 'ISD_API'
import {updateStateData} from 'actions'

class FormPhieunhap extends React.Component {
  constructor(props) {
    super(props);
    this.openQTSX = this.openQTSX.bind(this);
    this.loadQuyTrinhMau = this.loadQuyTrinhMau.bind(this);
  }
  handleSubmit = (e) => {
    e.preventDefault();
    let isValid = this.validBeforeSave();
    if(isValid) {
      fetch(ISD_BASE_URL + 'sx/update', {
        method: 'POST',
        headers: getTokenHeader(),
        body: JSON.stringify(this.props.mainState.sx)
      })
      .then((response) => {
        return response.json()
      }).then((json) => {
        if(json.status == 'error') {
          message.error(json.message, 3);
          if(json.show_login) {
            this.props.dispatch(updateStateData({showLogin: true}));
          }
        } else {
          message.success(json.message);
          this.props.dispatch(updateStateData({
            sx: {
              refresh: true
            },
            phieuAction: {}
          }));
        }
      }).catch((ex) => {
        console.log('parsing failed', ex)
        message.error('Có lỗi xảy ra trong quá trình lưu hoặc chỉnh sửa!');
      });
    }
  }
  loadQuyTrinhMau(quyTrinhId) {
    let {sx} = this.props.mainState;
    let ngaySanXuat = sx && sx.nsx ? sx.nsx : '';
    let maSx = sx && sx.ma_sx ? sx.ma_sx : '';
    if(maSx && quyTrinhId) {
      fetch(ISD_BASE_URL + `gantt/fetchTasksFromSample/${maSx}/${quyTrinhId}/${ngaySanXuat}`, {
        headers: getTokenHeader()
      })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        if(json.status == 'error') {
          message.warning(json.message, 3);
        } else {
          if(json.data) {
            this.props.dispatch(updateStateData({
              ganttData: json.data,
              refreshGantt: true
            }));
          }
        }
      })
      .catch((error) => {
        message.error('Có lỗi khi tải dữ liệu quy trình sản xuất!', 3);
        console.log(error);
      }); 
    }
  }
  validBeforeSave() {
    let {sx} = this.props.mainState;
    if(!sx.so) {
      message.error('Mã sản xuất không được để trống');
      return false;
    }
    // if(!sx.products.length) {
    //   message.error('Chưa có sản phẩm nào trong lệnh sản xuất này.');
    //   return false;
    // }
    return true;
  }
  openQTSX(showGantt) {
    let updateData = {
      quyTrinhTheoLenh: {
        ...this.props.mainState.quyTrinhTheoLenh,
        showGantt: showGantt
      }
    };
    if(!showGantt) {
      updateData.ganttData = blankGanttData;
    }
    this.props.dispatch(updateStateData(updateData));
  }
  cancel() {
    this.props.dispatch(updateStateData({
      phieuAction: {
        ...this.props.mainState.phieuAction,
        addNewItem: false
      }
    }));
  }

  render() {
    let {phieuAction, quyTrinhTheoLenh, quyTrinhSx, ganttData} = this.props.mainState;
    let quyTrinhMau = quyTrinhSx && quyTrinhSx.listQuyTrinh ? quyTrinhSx.listQuyTrinh : [];
    return (
      <div>
        {quyTrinhTheoLenh.showGantt ? 
          <div className="wrap-gantt-chart">
          <div className="table-operations">
              <Row>
                <Col span={12}>
                  <h2 className="head-title">Quy trình sản xuất</h2>
                </Col>
                <Col span={12}>
                  <div className="action-btns">
                    {ganttData.data && !ganttData.data.length ? 
                      <Select
                        showSearch
                        style={{ minWidth: 200 }}
                        placeholder="Chọn quy trình mẫu"
                        onChange={(value) => {
                          if(value) {
                            this.loadQuyTrinhMau(value);
                          }
                        }}>
                        <Select.Option value="">Chọn quy trình mẫu</Select.Option>
                        {quyTrinhMau.map((quytrinh) => {
                          return  <Select.Option value={quytrinh.id} key={quytrinh.id}>{quytrinh.name}</Select.Option>
                        })}
                      </Select>
                      : null}
                    <Button 
                      onClick={() => this.openQTSX(false)}
                      style={{marginLeft: 10}}
                      icon="left"
                      type="default">Quay lại form</Button>
                  </div>
                </Col>
              </Row>
            </div>
            <Gantt
              type="theo_lenh_sx"
              dispatch={this.props.dispatch} 
              mainState={this.props.mainState}
            />
          </div>
          : 
          <React.Fragment>
            <div className="table-operations">
              <Row>
                <Col span={12}>
                  <h2 className="head-title">Lệnh sản xuất</h2>
                </Col>
                <Col span={12}>
                  <div className="action-btns">
                  {phieuAction && phieuAction.action == 'edit'? 
                  <React.Fragment>
                  <Button 
                    onClick={this.handleSubmit}
                    type="primary"
                    htmlType="button" 
                    icon="save">Lưu</Button>
                  <Popconfirm
                    title="Bạn thật sự muốn huỷ?"
                    onConfirm={() => this.cancel()}
                  >
                    <Button 
                      style={{marginLeft: 10}}
                      type="danger">Huỷ</Button>
                  </Popconfirm> 
                  </React.Fragment>
                  :
                  <React.Fragment>
                      <Button 
                        onClick={() => this.openQTSX(true)}
                        style={{marginRight: 10}}
                        icon="share-alt"
                        type="primary">Quy trình SX</Button>
                      <Button 
                        onClick={() => {
                          this.props.dispatch(updateStateData({
                            phieuAction: {
                              ...this.props.mainState.phieuAction,
                              action: 'edit'
                            }
                          }));
                        }}
                        type="primary"
                        htmlType="button" 
                        icon="edit">Sửa</Button>
                      <Button 
                          onClick={() => this.cancel()}
                          style={{marginLeft: 10}}
                          icon="left"
                          type="default">Quay lại</Button>
                  </React.Fragment>
                  }
                  </div>
                </Col>
              </Row>
            </div>
            <FormThongTin 
              dispatch={this.props.dispatch} 
              mainState={this.props.mainState}/>
            <FormSanpham
              dispatch={this.props.dispatch} 
              mainState={this.props.mainState}/>
            <FormNote 
              dispatch={this.props.dispatch} 
              mainState={this.props.mainState}/>
          </React.Fragment>
          }
      </div>
      
    );
  }
}

export default connect((state) => {
  return {  
    mainState: state.main.present
  }
})(FormPhieunhap)