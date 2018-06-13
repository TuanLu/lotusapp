import React from 'react'
import { Form, Icon, Input, Button, message } from 'antd';
const FormItem = Form.Item;
import {updateStateData} from 'actions'

class NormalLoginForm extends React.Component {
  state = {
    loading: false
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        //console.log('Received values of form: ', values);
        this.setState({
          loading: true
        })
        this.getToken({...values});
      }
    });
  }
  getToken(playload) {
    fetch(ISD_BASE_URL + 'token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(playload)
    })
    .then((response) => response.json())
    .then((json) => {
      if(json.token) {
        sessionStorage.setItem('ISD_TOKEN', json.token);
        this.props.dispatch(updateStateData({
          showLogin: false,
          userRoles: json.scopes || [],
          userInfo: json.userInfo,
          defaultRouter: json.scopes[0] && json.scopes[0]['path'] ? json.scopes[0]['path'] : ''
        }));
      } else {
        message.error(json.message, 5);
        this.setState({
          loading: false
        })
      }
    })
    .catch((error) => {
      console.warn(error);
      message.error('Có lỗi trong quá trình đăng nhập!');
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="login-wrapper">
        <div className="login-logo" >
          <img src="./images/logo.png"/>
        </div>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <FormItem>
            {getFieldDecorator('userName', {
              rules: [{ required: true, message: 'Nhập tên đăng nhập!' }],
            })(
              <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Tên đăng nhập" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Nhập mật khẩu!' }],
            })(
              <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Mật khẩu" />
            )}
          </FormItem>
          <FormItem>
            <Button loading={this.state.loading} type="primary" htmlType="submit" className="login-form-button">
              Đăng nhập
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

export default WrappedNormalLoginForm;