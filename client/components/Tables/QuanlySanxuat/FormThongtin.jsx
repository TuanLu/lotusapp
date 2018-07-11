import React from 'react'
import moment from 'moment';
import { Form, Select, Input, Row, Col, Button,Popconfirm,message } from 'antd';
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
    fetch(ISD_BASE_URL + 'sx/fetchKho', {
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
    let {sx, phieuAction} = this.props.mainState;
    let readOnly = phieuAction && phieuAction.action == 'view' ? true : false;
    let options = '';
    let {kho} = this.props.mainState;
    if(kho.length) {
      options = kho.map((kho) => <Option key={kho.id} value={kho.id}>{kho.name}</Option>);
    }
    return (
      <Form>
        <Row>
            <Col span={12}>
            <FormItem
              label={'Số'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      so: e.target.value
                    }
                  }));
                }}
                value={sx.so} />
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem
              label={'Công đoạn'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      cong_doan: e.target.value
                    }
                  }));
                }}
                value={sx.cong_doan} />
            </FormItem>
            </Col>
        </Row>
        <Row>
            <Col span={12}>
            <FormItem
              label={'Mã'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      ma: e.target.value
                    }
                  }));
                }}
                value={sx.ma} />
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem
              label={'Sản phẩm'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      ma_sp: e.target.value
                    }
                  }));
                }}
                value={sx.ma_sp} />
            </FormItem>
            </Col>
            </Row>
            <Row>
            <Col span={12}>
              <FormItem
                label={'Cỡ Lô'}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
              >
              <Input 
                  readOnly={readOnly}
                  onChange={(e) => {
                    this.props.dispatch(updateStateData({
                      sx: {
                        ...this.props.mainState.sx,
                        co_lo: e.target.value
                      }
                    }));
                  }}
                  value={sx.co_lo} />
              </FormItem>
            </Col>
            <Col span={12}>
            <FormItem
              label={'SĐK'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      so_dk: e.target.value
                    }
                  }));
                }}
                value={sx.so_dk} />
            </FormItem>
            </Col>
        </Row>
        <Row>
            <Col span={12}>
            <FormItem
              label={'Số lô'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      so_lo: e.target.value
                    }
                  }));
                }}
                value={sx.so_lo} />
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem
              label={'QCĐG'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      qcdg: e.target.value
                    }
                  }));
                }}
                value={sx.qcdg} />
            </FormItem>
            </Col>
        </Row>
        <Row>
            <Col span={12}>
            <FormItem
              label={'HSD'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      hd: e.target.value
                    }
                  }));
                }}
                value={sx.hd} />
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem
              label={'NSX'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      nsx: e.target.value
                    }
                  }));
                }}
                value={sx.nsx} />
            </FormItem>
            </Col>
            </Row>
            <Row>
            <Col span={12}>
            <FormItem
              label={'ĐH'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      dh: e.target.value
                    }
                  }));
                }}
                value={sx.dh} />
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem
              label={'Dạng bào chế'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      dang_bao_che: e.target.value
                    }
                  }));
                }}
                value={sx.dang_bao_che} />
            </FormItem>
            </Col>
            </Row>
            <Row>
            <Col span={12}>
            <FormItem
              label={'TTTB/KLTB'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      tttb_kltb: e.target.value
                    }
                  }));
                }}
                value={sx.tttb_kltb} />
            </FormItem>
            </Col>
        </Row>
      </Form>
    );
  }
}

export default FormThongtin;