import React from 'react'
import moment from 'moment';
import { Form, Select, Input, Button,Popconfirm,message } from 'antd';
import {updateStateData} from 'actions'
import {getTokenHeader} from 'ISD_API'
const FormItem = Form.Item;
const Option = Select.Option;
const dateFormat = 'YYYY/MM/DD';

class QTSXForm extends React.Component {
  constructor(props) {
    super(props);
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }
  render() {
    let {quyTrinhSx} = this.props.mainState;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem
          label="Tên quy trình"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Nhập tên quy trình!' }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          label="Mô tả quy trình"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
          {getFieldDecorator('note', {
            rules: [{ required: false }],
          })(
            <Input.TextArea 
              autosize={{ minRows: 2, maxRows: 6 }}
            />
          )}
        </FormItem>
        <FormItem
          wrapperCol={{ span: 12, offset: 5 }}
        >
          <Button type="primary" htmlType="submit">
            Lưu và tiếp tục
          </Button>
          <Button type="primary" htmlType="submit">
            Lưu và đóng
          </Button>
        </FormItem>
      </Form>
    );
  }
}
const WrappedApp = Form.create()(QTSXForm);

export default WrappedApp;