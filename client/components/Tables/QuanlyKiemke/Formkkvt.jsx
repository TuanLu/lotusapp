import React from 'react'
import {connect} from 'react-redux'
import FormThongTin from './FormThongtin'
import FormSanpham from './FormSanpham'
import { Row, Button, Col, Popconfirm,message } from 'antd';
import {getTokenHeader} from 'ISD_API'
import {updateStateData} from 'actions'

class Formkkvt extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    let isValid = this.validBeforeSave();
    if(isValid) {
      fetch(ISD_BASE_URL + 'kkvt/update', {
        method: 'POST',
        headers: getTokenHeader(),
        body: JSON.stringify(this.props.mainState.kkvt)
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
            kkvt: {
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
  validBeforeSave() {
    let {kkvt} = this.props.mainState;
    if(!kkvt.ma_kho) {
      message.error('Mã kho không được để trống');
      return false;
    }
    if(!kkvt.products.length) {
      message.error('Chưa có sản phẩm nào trong phiếu này.');
      return false;
    }
    if(kkvt.ma_phieu != "" && !kkvt.editNote) {
      message.error('Hãy nhập lý do sửa phiếu');
      return false;
    }
    return true;
  }
  pheDuyet(value) {
    this.setState({ loading: true });
    let {kkvt} = this.props.mainState;
    let pheDuyetData = {
      value,
      ma_phieu: kkvt.ma_phieu
    };
    fetch(ISD_BASE_URL + 'kkvt/pheduyet', {
      method: 'POST',
      headers: getTokenHeader(),
      body: JSON.stringify(pheDuyetData)
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
          kkvt: {
            ...this.props.mainState.kkvt,
            refresh: true,
            ...json.data
          },
        }));
      }
    }).catch((ex) => {
      console.log('parsing failed', ex)
      message.error('Có lỗi xảy ra trong quá trình phê duyệt!');
    });
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
    let {phieuAction, kkvt} = this.props.mainState;
    let tinh_trang = kkvt.tinh_trang || '';
    return (
      <div>
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">Thông tin phiếu kiểm kê</h2>
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
                  {(this.props.isInventoryOwner )? 
                    <React.Fragment>
                      {tinh_trang == 1? 
                        <Button 
                          onClick={() => this.pheDuyet(0)}
                          style={{marginRight: 10}}
                          icon="exclamation-circle"
                          type="danger">
                          Huỷ phê duyệt
                      </Button>
                      : 
                      <Button 
                        onClick={() => this.pheDuyet(1)}
                        style={{marginRight: 10}}
                        icon="check-circle"
                        type="primary">
                        Phê duyệt
                      </Button>
                      }
                    </React.Fragment>
                  : null}
                  {(this.props.isInventoryOwner )? 
                  <React.Fragment>
                    <Popconfirm
                    title="Bạn thật sự muốn xoá phiếu này?"
                    onConfirm={() => this.props.onDelete()}
                  >
                    <Button 
                      style={{marginRight: 10}}
                      icon="close-circle"
                      type="danger">
                          Xoá
                      </Button>
                  </Popconfirm>
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
                    </React.Fragment>
                    : null}
                    <Button 
                        onClick={() => this.cancel()}
                        style={{marginLeft: 10}}
                        icon="left"
                        type="default">
                        Quay lại
                    </Button>
                </React.Fragment>
                }
              </div>
            </Col>
          </Row>
        </div>
        <FormThongTin 
          pheDuyet={(tinh_trang) => {
            this.pheDuyet(tinh_trang);
          }}
          isInventoryOwner={this.props.isInventoryOwner}
          dispatch={this.props.dispatch} 
          mainState={this.props.mainState}/>
        <FormSanpham
          isQA={this.props.isQA}
          isQC={this.props.isQC}
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
})(Formkkvt)