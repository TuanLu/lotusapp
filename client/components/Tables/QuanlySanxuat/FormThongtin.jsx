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
            <Col span={8}>
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
            <Col span={8}>
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
            <Col span={8}>
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
                      ma_sx: e.target.value
                    }
                  }));
                }}
                value={sx.ma_sx} />
            </FormItem>
            </Col>
        </Row>
        <Row>
            <Col span={8}>
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
                      sp: e.target.value
                    }
                  }));
                }}
                value={sx.sp} />
            </FormItem>
            </Col>
            <Col span={8}>
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
                value={sx.so} />
            </FormItem>
            </Col>
            <Col span={8}>
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
                      ma_sx: e.target.value
                    }
                  }));
                }}
                value={sx.so} />
            </FormItem>
            </Col>
        </Row>
        
        {/* <FormItem
          label="Trạng Thái"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
          <Select 
            disabled={readOnly}
            onChange={(tinh_trang) => {
              this.props.dispatch(updateStateData({
                sx: {
                  ...this.props.mainState.sx,
                  tinh_trang
                }
              }));
            }}
            defaultValue={sx.tinh_trang} placeholder="Chọn trạng thái">
            {trangThaiPhieu.map((status) =>{
              return <Option value={status.value} key={status.value}>{status.text}</Option>
            })}
          </Select>
        </FormItem> */}
        <FormItem
          label={'Ngày tạo'}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
          <Input 
            readOnly={true}
            onChange={(e) => {
            }}
            value={sx.create_on || moment(new Date()).format("DD/MM/YYYY")} />
        </FormItem>
      </Form>
    );
  }
}

export default FormThongtin;