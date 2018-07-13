import React from 'react'
import moment from 'moment';
import { Form, Select, Input, Button,Popconfirm,message } from 'antd';
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
    let {phieunhap, phieuAction} = this.props.mainState;
    let readOnly = phieuAction && phieuAction.action == 'view' ? true : false;
    let options = '';
    let {kho} = this.props.mainState;
    if(kho.length) {
      options = kho.map((kho) => <Option key={kho.id} value={kho.id}>{kho.name}</Option>);
    }
    return (
      <Form>
        <FormItem
          label={'Số chứng từ'}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
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
        <FormItem
          label={formInfo.person}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
         <Input 
            readOnly={readOnly}
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
        <FormItem
          label="Mô tả"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
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
        <FormItem
          label="Địa điểm"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
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
        {/* <FormItem
          label="Trạng Thái"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
          <Select 
            disabled={readOnly}
            onChange={(tinh_trang) => {
              this.props.dispatch(updateStateData({
                phieunhap: {
                  ...this.props.mainState.phieunhap,
                  tinh_trang
                }
              }));
            }}
            defaultValue={phieunhap.tinh_trang} placeholder="Chọn trạng thái">
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
              // this.props.dispatch(updateStateData({
              //   phieunhap: {
              //     ...this.props.mainState.phieunhap,
              //     nguoi_giao_dich: e.target.value
              //   }
              // }));
            }}
            value={phieunhap.create_on || moment(new Date()).format("DD/MM/YYYY")} />
        </FormItem>
        {phieunhap.ma_phieu != "" ? 
          <FormItem
            label="Lý do sửa phiếu"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 12 }}
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
      </Form>
    );
  }
}

export default FormThongtin;