import React from 'react'
import { Form, Select, Input, Button, Row, Col,Popconfirm,message } from 'antd';
import {updateStateData} from 'actions'
import {getTokenHeader} from 'ISD_API'
const FormItem = Form.Item;
const Option = Select.Option;


const formInfo = {
  person: 'Người giao hàng'
}

class FormThongtin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: []
    }
  }
  handleSubmit = (e) => {
    e.preventDefault();
    let isValid = this.validBeforeSave();
    if(isValid) {

    }
  }
  validBeforeSave() {
    let {phieunhap} = this.props.mainState;
    if(!phieunhap.ma_kho) {
      message.error('Mã kho không được để trống');
      return false;
    }
    if(!phieunhap.nguoi_giao_dich) {
      message.error('Thiếu thông tin người giao dịch');
      return false;
    }
    if(!phieunhap.products.length) {
      message.error('Chưa có sản phẩm nào trong phiếu này.');
      return false;
    }
    return true;
  }
  fetchData() {
    fetch(ISD_BASE_URL + 'qlkho/fetchKho', {
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
          this.props.dispatch(updateStateData({kho: json.data}));
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu dữ liệu kho!', 3);
      console.log(error);
    }); 
  }
  componentDidMount() {
    let {kho} = this.props.mainState;
    if(!kho.length) {
      this.fetchData();
    }
  }
  render() {
    let {phieunhap} = this.props.mainState;
    let options = '';
    let {kho} = this.props.mainState;
    if(kho.length) {
      options = kho.map((kho) => <Option key={kho.id} value={kho.id}>{kho.name}</Option>);
    }
    return (
      <Form>
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">Thông tin phiếu nhập</h2>
            </Col>
            <Col span={12}>
              <div className="action-btns">
                <Button 
                  onClick={this.handleSubmit}
                  type="primary"
                  htmlType="button" 
                  icon="save">Lưu phiếu nhập</Button>
                <Popconfirm
                  title="Bạn thật sự muốn huỷ?"
                  onConfirm={() => this.props.onCancel()}
                >
                  <Button 
                    type="danger">Huỷ</Button>
                </Popconfirm>
                
              </div>
            </Col>
          </Row>
        </div>
        <FormItem
          label={formInfo.person}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
         <Input 
            onChange={(e) => {
              this.props.dispatch(updateStateData({
                phieunhap: {
                  ...this.props.mainState.phieunhap,
                  nguoi_giao_dich: e.target.value
                }
              }));
            }}
            value={phieunhap.nguoi_giao_dich} />
        </FormItem>
        <FormItem
          label="Tại Kho"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
          <Select 
            onChange={(ma_kho) => {
              this.props.dispatch(updateStateData({
                phieunhap: {
                  ...this.props.mainState.phieunhap,
                  ma_kho
                }
              }));
            }}
            defaultValue={phieunhap.ma_kho} placeholder="Chọn kho">
            {options}
          </Select>
        </FormItem>
        <FormItem
          label="Mô tả"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
          <Input.TextArea 
            autosize={{ minRows: 2, maxRows: 6 }}
            onChange={(e) => {
              this.props.dispatch(updateStateData({
                phieunhap: {
                  ...this.props.mainState.phieunhap,
                  note: e.target.value
                }
              }));
            }}
            value={phieunhap.note} />
        </FormItem>
        <FormItem
          label="Địa điểm"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
          <Input.TextArea 
            autosize={{ minRows: 2, maxRows: 6 }}
            onChange={(e) => {
              this.props.dispatch(updateStateData({
                phieunhap: {
                  ...this.props.mainState.phieunhap,
                  address: e.target.value
                }
              }));
            }}
            value={phieunhap.address} />
        </FormItem>
        <FormItem
          wrapperCol={{ span: 12, offset: 5 }}
        >
        </FormItem>
      </Form>
    );
  }
}

export default FormThongtin;