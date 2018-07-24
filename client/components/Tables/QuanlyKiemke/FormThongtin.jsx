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
  componentDidMount() {
    let {kho} = this.props.mainState;
    if(!kho.length) {
      this.fetchData();
    }
  }
  render() {
    let {kkvt, phieuAction} = this.props.mainState;
    let readOnly = phieuAction && phieuAction.action == 'view' ? true : false;
    let tinh_trang = kkvt.tinh_trang == 1 ? true : false;
    let options = '';
    let {kho} = this.props.mainState;
    if(kho.length) {
      options = kho.map((kho) => <Option key={kho.id} value={kho.ma_kho}>{kho.name}</Option>);
    }
    return (
      <Form>
      {kkvt.ma_phieu != "" ?
            this.props.isInventoryOwner? 
        <Row>
          <Col span={12}>
            <FormItem
              label="Trạng Thái"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 16 }}
            >
              <Switch checkedChildren="Đã duyệt" unCheckedChildren="Chưa duyệt" checked ={tinh_trang} 
                onChange={(tinh_trang) => {
                  this.props.pheDuyet(tinh_trang);
                }} />
              {/* <Select 
                disabled={readOnly}
                onChange={(tinh_trang) => {
                  this.props.dispatch(updateStateData({
                    kkvt: {
                      ...this.props.mainState.kkvt,
                      tinh_trang
                    }
                  }));
                }}
                defaultValue={kkvt.tinh_trang} placeholder="Chọn trạng thái">
                {trangThaiPhieu.map((status) =>{
                  return <Option value={status.value} key={status.value}>{status.text}</Option>
                })}
              </Select> */}
            </FormItem>
            </Col>
            <Col span={12}>
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
                      kkvt: {
                        ...this.props.mainState.kkvt,
                        editNote: e.target.value
                      }
                    }));
                  }}
                  value={kkvt.editNote} />
              </FormItem>
            </Col>
        </Row>
        : null
        : null}
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
                  kkvt: {
                    ...this.props.mainState.kkvt,
                    ma_kho
                  }
                }));
              }}
              defaultValue={kkvt.ma_kho} placeholder="Chọn kho">
              {options}
            </Select>
          </FormItem>   
          </Col>
          <Col span={12}>
            <FormItem
              label={'Ngày tạo'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 16 }}
            >
            <Input 
              readOnly={true}
              onChange={(e) => {
                // this.props.dispatch(updateStateData({
                //   kkvt: {
                //     ...this.props.mainState.kkvt,
                //     nguoi_giao_dich: e.target.value
                //   }
                // }));
              }}
              value={kkvt.create_on || moment(new Date()).format("DD/MM/YYYY")} />
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
                  kkvt: {
                    ...this.props.mainState.kkvt,
                    note: e.target.value
                  }
                }));
              }}
              value={kkvt.note} />
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
                  kkvt: {
                    ...this.props.mainState.kkvt,
                    address: e.target.value
                  }
                }));
              }}
              value={kkvt.address} />
            </FormItem>
          </Col>
        </Row>
        
      </Form>
    );
  }
}

export default FormThongtin;