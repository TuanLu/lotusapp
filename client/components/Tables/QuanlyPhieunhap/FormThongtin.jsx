import React from 'react'
import { Form, Select, Input, Button, Row, Col,Popconfirm,message } from 'antd';
import {updateStateData} from 'actions'
import {getTokenHeader} from 'ISD_API'
import FormSanpham from './FormSanpham'
const FormItem = Form.Item;
const Option = Select.Option;


const formInfo = {
  person: 'Người giao hàng'
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: []
    }
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        if(!this.state.products.length) {
          message.error('Chưa có sản phẩm trong phiếu nhập này!');
          return false;
        }
        let finalInfo = {
          ...values,
          products: this.props.products
        };
        console.log(finalInfo);
      }
    });
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
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit}>
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">Thông tin phiếu nhập</h2>
            </Col>
            <Col span={12}>
              <div className="action-btns">
                <Button 
                  type="primary"
                  htmlType="submit" 
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
          {getFieldDecorator('ho_ten', {
            rules: [{ required: true, 'message': 'Hãy nhập tên người giao hàng'}],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          label="Tại Kho"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
          {getFieldDecorator('kho_id', {
            rules: [{ required: true, message: 'Chọn kho!' }],
          })(
            (() => {
              let options = '';
              let {kho} = this.props.mainState;
              if(kho.length) {
                options = kho.map((kho) => <Option key={kho.id} value={kho.id}>{kho.name}</Option>);
              }
              return (
                <Select
                  placeholder="Chọn kho"
                >
                  {options}
                </Select>
              )
            })()
            
          )}
        </FormItem>
        <FormItem
          label="Mô tả"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
          {getFieldDecorator('note', {
            rules: [{ required: false}],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          label="Địa điểm"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
          {getFieldDecorator('address', {
            rules: [{ required: false}],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          wrapperCol={{ span: 12, offset: 5 }}
        >
        </FormItem>
        <FormSanpham 
          onSaveItem={(data) => {
            this.setState({data});
          }}
          onDeleteItem={(id) => {
            
          }}
          dispatch={this.props.dispatch} 
          mainState={this.props.mainState}/>
      </Form>
    );
  }
}

const WrappedApp = Form.create()(App);

export default WrappedApp;