import React from 'react'
import {connect} from 'react-redux'
import FormThongTin from './FormThongtin'
import FormSanpham from './FormSanpham'
import { Row, Button, Col, Popconfirm,message } from 'antd';
import {getTokenHeader} from 'ISD_API'
import {updateStateData} from 'actions'

class FormPhieunhap extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    let isValid = this.validBeforeSave();
    if(isValid) {
      fetch(ISD_BASE_URL + 'phieunhap/update', {
        method: 'POST',
        headers: getTokenHeader(),
        body: JSON.stringify(this.props.mainState.phieunhap)
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
            phieunhap: {
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
    let {phieunhap} = this.props.mainState;
    if(!phieunhap.ma_kho) {
      message.error('Mã kho không được để trống');
      return false;
    }
    if(!phieunhap.products.length) {
      message.error('Chưa có sản phẩm nào trong phiếu này.');
      return false;
    }
    if(phieunhap.ma_phieu != "" && !phieunhap.editNote) {
      message.error('Hãy nhập lý do sửa phiếu');
      return false;
    }
    return true;
  }
  delete() {

  }
  pheduyet() {
    let isValid = this.validBeforeSave();
    if(isValid) {
      // Thay status, phê duyệt phiếu nhập
    }
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
    let {phieuAction} = this.props.mainState;
    return (
      <div>
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">Thông tin phiếu nhập</h2>
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
                  <Button 
                      onClick={() => this.pheduyet()}
                      style={{marginRight: 10}}
                      icon="check-circle"
                      type="primary">
                      Phê duyệt
                  </Button>
                  : null}
                  {(this.props.isInventoryOwner )? 
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
                    : null}
                    {(this.props.isInventoryOwner )? 
                    <Popconfirm
                      title="Bạn thật sự muốn xoá?"
                      okType="danger"
                      onConfirm={() => this.delete(record)}
                    >
                      <Button 
                          style={{marginLeft: 10}}
                          icon="delete"
                          type="danger">
                          Xóa
                      </Button>  
                    </Popconfirm>
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
})(FormPhieunhap)