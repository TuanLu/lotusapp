import React from 'react'
import {connect} from 'react-redux'
import FormThongTin from './FormThongtin'
import FormSanpham from './FormSanpham'
import FormNote from './FormNote'
import Gantt from './../QuanlyQuytrinhSanxuat/Gantt'
import { Row, Button, Col, Popconfirm, message, Select } from 'antd';
import {getTokenHeader, blankGanttData} from 'ISD_API'
import {updateStateData} from 'actions'

class FormRnd extends React.Component {
  constructor(props) {
    super(props);
    this.openQTSX = this.openQTSX.bind(this);
    this.loadQuyTrinhMau = this.loadQuyTrinhMau.bind(this);
  }
  handleSubmit = (e) => {
    e.preventDefault();
    let isValid = this.validBeforeSave();
    if(isValid) {
      fetch(ISD_BASE_URL + 'rnd/update', {
        method: 'POST',
        headers: getTokenHeader(),
        body: JSON.stringify(this.props.mainState.rnd)
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
            rnd: {
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
    let {rnd} = this.props.mainState;
    let ngaySanXuat = rnd && rnd.nsx ? rnd.nsx : '';
    let maRnd = rnd && rnd.ma_rnd ? rnd.ma_rnd : '';
    if(maRnd && quyTrinhId) {
      fetch(ISD_BASE_URL + `gantt/fetchTasksFromSample/${maRnd}/${quyTrinhId}/${ngaySanXuat}`, {
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
    let {rnd} = this.props.mainState;
    if(!rnd.ma_nc) {
      message.error('Mã nghiên cứu không được để trống');
      return false;
    }
    // if(!sx.products.length) {
    //   message.error('Chưa có sản phẩm nào trong lệnh nghiên cứu này.');
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
    let {phieuAction, quyTrinhTheoLenh, quyTrinhSx, ganttData, ans_language} = this.props.mainState;
    let quyTrinhMau = quyTrinhSx && quyTrinhSx.listQuyTrinh ? quyTrinhSx.listQuyTrinh : [];
    return (
      <div>
        {quyTrinhTheoLenh.showGantt ? 
          <div className="wrap-gantt-chart">
          <div className="table-operations">
              <Row>
                <Col span={12}>
                  <h2 className="head-title">{ans_language.ans_quy_trinh_san_xuat || 'ans_quy_trinh_san_xuat'}</h2>
                </Col>
                <Col span={12}>
                  <div className="action-btns">
                    {ganttData.data && !ganttData.data.length ? 
                      <Select
                        showSearch
                        style={{ minWidth: 200 }}
                        placeholder={ans_language.ans_chon_quy_trinh_san_xuat || 'ans_chon_quy_trinh_san_xuat'}
                        onChange={(value) => {
                          if(value) {
                            this.loadQuyTrinhMau(value);
                          }
                        }}>
                        <Select.Option value="">{ans_language.ans_chon_quy_trinh_san_xuat || 'ans_chon_quy_trinh_san_xuat'}</Select.Option>
                        {quyTrinhMau.map((quytrinh) => {
                          return  <Select.Option value={quytrinh.id} key={quytrinh.id}>{quytrinh.name}</Select.Option>
                        })}
                      </Select>
                      : null}
                    <Button 
                      onClick={() => this.openQTSX(false)}
                      style={{marginLeft: 10}}
                      icon="left"
                      type="default">{ans_language.ans_back || 'ans_back'}</Button>
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
                  <h2 className="head-title">{ans_language.ans_rnd_title || 'ans_rnd_title'}</h2>
                </Col>
                <Col span={12}>
                  <div className="action-btns">
                  {phieuAction && phieuAction.action == 'edit'? 
                  <React.Fragment>
                  <Button 
                    onClick={this.handleSubmit}
                    type="primary"
                    htmlType="button" 
                    icon="save">{ans_language.ans_save || 'ans_save'}</Button>
                  <Popconfirm
                    title="Bạn thật sự muốn huỷ?"
                    onConfirm={() => this.cancel()}
                  >
                    <Button 
                      style={{marginLeft: 10}}
                      type="danger">{ans_language.ans_cancel || 'ans_cancel'}</Button>
                  </Popconfirm> 
                  </React.Fragment>
                  :
                  <React.Fragment>
                      <Button 
                        onClick={() => this.openQTSX(true)}
                        style={{marginRight: 10}}
                        icon="share-alt"
                        type="primary">{ans_language.ans_quy_trinh_san_xuat || 'ans_quy_trinh_san_xuat'}</Button>
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
                        icon="edit">{ans_language.ans_edit || 'ans_edit'}</Button>
                      <Button 
                          onClick={() => this.cancel()}
                          style={{marginLeft: 10}}
                          icon="left"
                          type="default">{ans_language.ans_cancel || 'ans_cancel'}</Button>
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
})(FormRnd)