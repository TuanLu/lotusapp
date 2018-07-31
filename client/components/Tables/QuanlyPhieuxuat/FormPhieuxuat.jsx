import React from 'react'
import {connect} from 'react-redux'
import FormThongTin from './FormThongtin'
import FormSanpham from './FormSanpham'
import DanhsachSanpham from './DanhsachSanpham'
import { Row, Button, Col, Popconfirm,message,Modal } from 'antd';
import {getTokenHeader} from 'ISD_API'
import {updateStateData} from 'actions'

class FormPhieuxuat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItems: []
    }
  }
  handleSubmit = (e) => {
    e.preventDefault();
    let isValid = this.validBeforeSave();
    if(isValid) {
      fetch(ISD_BASE_URL + 'phieuxuat/update', {
        method: 'POST',
        headers: getTokenHeader(),
        body: JSON.stringify(this.props.mainState.phieuxuat)
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
            phieuxuat: {
              refresh: true
            },
            phieuXuatAction: {}
          }));
        }
      }).catch((ex) => {
        console.log('parsing failed', ex)
        message.error('Có lỗi xảy ra trong quá trình lưu hoặc chỉnh sửa!');
      });
    }
  }
  validBeforeSave() {
    let {phieuxuat} = this.props.mainState;
    if(!phieuxuat.ma_kho) {
      message.error('Mã kho không được để trống');
      return false;
    }
    // if(!phieuxuat.nguoi_giao_dich) {
    //   message.error('Thiếu thông tin người giao dịch');
    //   return false;
    // }
    if(!phieuxuat.products.length) {
      message.error('Chưa có sản phẩm nào trong phiếu này.');
      return false;
    }
    if(phieuxuat.ma_phieu != "" && !phieuxuat.editNote) {
      message.error('Hãy nhập lý do sửa phiếu');
      return false;
    }
    return true;
  }
  cancel() {
    this.props.dispatch(updateStateData({
      phieuXuatAction: {
        ...this.props.mainState.phieuXuatAction,
        addNewItem: false
      }
    }));
  }

  render() {
    let {phieuXuatAction} = this.props.mainState;
    return (
      <div>
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">Thông tin phiếu xuất</h2>
            </Col>
            <Col span={12}>
              <div className="action-btns">
                {phieuXuatAction && phieuXuatAction.action == 'edit'? 
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
                    onClick={() => {
                      this.props.dispatch(updateStateData({
                        phieuXuatAction: {
                          ...this.props.mainState.phieuXuatAction,
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
        <Modal
          width={"95%"}
          title="Chọn vật tư cho phiếu xuất"
          okText="Chọn vật tư"
          cancelText="Đóng"
          visible={phieuXuatAction.openModal}
          onCancel={() => {
            this.props.dispatch(updateStateData({
              phieuXuatAction: {
                ...this.props.mainState.phieuXuatAction,
                openModal: false
              }
            }));
          }}
          onOk={() => {
            let selectedProducts = this.props.mainState.productsForExport.filter((item) => this.state.selectedItems.indexOf(item.id) !== -1);
            //Check selected products exist in phieuxuat state or not 
            let {phieuxuat} = this.props.mainState;
            let existsProductIds = [];
            if(phieuxuat.products && phieuxuat.products.length) {
              phieuxuat.products.forEach((product) => {
                existsProductIds.push(product.product_id);
              });
            }
            selectedProducts = selectedProducts.filter((newProduct) => existsProductIds.indexOf(newProduct.product_id) == -1);
            this.props.dispatch(updateStateData({
              phieuXuatAction: {
                ...this.props.mainState.phieuXuatAction,
                openModal: false
              },
              phieuxuat: {
                ...this.props.mainState.phieuxuat,
                products: [...this.props.mainState.phieuxuat.products, ...selectedProducts]
              }
            }));
          }}
          //footer={null}
          >
          <DanhsachSanpham
            onRowSelection={(selectedItems) => {
              this.setState({selectedItems: selectedItems})
            }}
            dispatch={this.props.dispatch} 
            mainState={this.props.mainState}/>
        </Modal>
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
})(FormPhieuxuat)