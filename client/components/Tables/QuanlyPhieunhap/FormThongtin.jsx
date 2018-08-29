import React from 'react'
import moment from 'moment';
import { Form, Select, Input, Switch, Row, Col, Button,Popconfirm,message } from 'antd';
import {updateStateData} from 'actions'
import {getTokenHeader, trangThaiPhieu} from 'ISD_API'
const FormItem = Form.Item;
const Option = Select.Option;
const dateFormat = 'YYYY/MM/DD';

const formInfo = {
  person: 'Người giao hàng'
}

class FormThongtin extends React.Component {
  constructor(props) {
    super(props);
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
  fetchNhacc() {
    fetch(ISD_BASE_URL + 'npp/fetchNpp', {
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
          this.props.dispatch(updateStateData({nhacc: json.data}));
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu dữ liệu kho!', 3);
      console.log(error);
    }); 
  }
  fetchOrders() {
    fetch(ISD_BASE_URL + 'order/fetchDh', {
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
          this.props.dispatch(updateStateData({order: json.data}));
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
    let {nhacc} = this.props.mainState;
    if(!nhacc.length) {
      this.fetchNhacc();
    }
    let {order} = this.props.mainState;
    if(!order.length) {
      this.fetchOrders();
    }
  }
  render() {
    let {phieunhap, phieuAction} = this.props.mainState;
    let readOnly = phieuAction && phieuAction.action == 'view' ? true : false;
    let tinh_trang = phieunhap.tinh_trang == 1 ? true : false;
    let options = ''; 
    let optionsnhacc = '';
    let orderlist = '';
    let {kho} = this.props.mainState;
    let {nhacc} = this.props.mainState;
    let {order} = this.props.mainState;
    if(nhacc.length) {
      optionsnhacc = nhacc.map((nhacc) => <Option key={nhacc.id} value={nhacc.ma_npp}>{nhacc.name}</Option>);
    }
    if(kho.length) {
      options = kho.map((kho) => <Option key={kho.id} value={kho.ma_kho}>{kho.name}</Option>);
    }
    if(order.length) {
      orderlist = order.map((order) => <Option key={order.id} value={order.ma_order}>{order.ma_order} - {order.ma_kh} - {order.product_id}</Option>);
    }
    return (
      <Form>
        <Row>
          <Col span={12}>
            <FormItem
              label={'Số chứng từ'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 16 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    phieunhap: {
                      ...this.props.mainState.phieunhap,
                      so_chung_tu: e.target.value
                    }
                  }));
                }}
                value={phieunhap.so_chung_tu} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={'Nhà cung cấp'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 16 }}
            >
              <Select 
                disabled={readOnly}
                onChange={(nguoi_giao_dich) => {
                  this.props.dispatch(updateStateData({
                    phieunhap: {
                      ...this.props.mainState.phieunhap,
                      nguoi_giao_dich
                    }
                  }));
                }}
                defaultValue={phieunhap.nguoi_giao_dich} placeholder="Chọn nhà cung cấp">
                {optionsnhacc}
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label="Tại Kho"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 16 }}
            >
            <Select 
              disabled={readOnly}
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
          </Col>
          <Col span={12}>
            <FormItem
              label={'Đơn hàng'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 16 }}
            >
            <Select 
              disabled={readOnly}
              onChange={(orderid) => {
                this.props.dispatch(updateStateData({
                  phieunhap: {
                    ...this.props.mainState.phieunhap,
                    orderid
                  }
                }));
              }}
              defaultValue={phieunhap.orderid} placeholder="Chọn đơn hàng">
              {orderlist}
            </Select>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label="Mô tả"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 16 }}
            >
            <Input.TextArea 
              readOnly={readOnly}
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
          </Col>
          <Col span={12}>
            <FormItem
            label="Địa điểm"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 16 }}
            >
            <Input.TextArea 
              readOnly={readOnly}
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
          </Col>
        </Row>
        <Row>
          {/* <Col span={12}>
            {this.props.isInventoryOwner? 
            <FormItem
              label="Trạng Thái"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 16 }}
            >
              <Switch checkedChildren="Đã duyệt" unCheckedChildren="Chưa duyệt" checked ={tinh_trang} 
                onChange={(tinh_trang) => {
                  this.props.pheDuyet(tinh_trang);
                }} />
            </FormItem>
            : null}
            </Col> */}
            <Col span={12}>
            {phieunhap.ma_phieu != "" ?
              <FormItem
                label="Lý do sửa phiếu"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 16 }}
              >
                <Input.TextArea 
                  readOnly={readOnly}
                  autosize={{ minRows: 2, maxRows: 6 }}
                  onChange={(e) => {
                    this.props.dispatch(updateStateData({
                      phieunhap: {
                        ...this.props.mainState.phieunhap,
                        editNote: e.target.value
                      }
                    }));
                  }}
                  value={phieunhap.editNote} />
              </FormItem>
            : null}
            </Col>
        </Row>
        
      </Form>
    );
  }
}

export default FormThongtin;