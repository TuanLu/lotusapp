import React from 'react'
import {updateStateData} from 'actions'
import { Form, Input, Tooltip, Icon, Select, Row, Col, Checkbox, Button, message } from 'antd';
import {getTokenHeader} from 'ISD_API'

const FormItem = Form.Item;
const Option = Select.Option;

class RegistrationForm extends React.Component {
  state = {
    confirmDirty: false,
    groupUser: []
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        //Get USER ID from mainstate
        let {user} = this.props.mainState;
        let userId = user && user.id ? user.id : '';
        values.id = userId;
        fetch(ISD_BASE_URL + 'users/updateUser', {
          method: 'POST',
          headers: getTokenHeader(),
          body: JSON.stringify(values)
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
            this.props.afterSave(json.data);
          }
        }).catch((ex) => {
          console.log('parsing failed', ex)
          message.error('Có lỗi xảy ra trong quá trình đăng kí thành viên!');
        });
      }
    });
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('hash')) {
      callback('Hai mật khẩu chưa khớp!');
    } else {
      callback();
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }
  fetchGroupUser() {
    fetch(ISD_BASE_URL + 'qlpb/fetchPb', {
      headers: getTokenHeader()
    })
    .then((response) => response.json())
    .then((json) => {
      if(json.data) {
        this.setState({
          groupUser: json.data
        });
        //Chi connect den server 1 lan
        this.props.dispatch(updateStateData({
          groupUser: json.data
        }));
      } else {
        console.warn(json.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }
  componentDidMount() {
    let {groupUser} = this.props.mainState; 
    if(!groupUser || !groupUser.length) {
      this.fetchGroupUser();
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };

    let {user, groupUser} = this.props.mainState;
    let phongBanOptions = [];
    //let {groupUser} = this.state;
    if(groupUser && groupUser.length) {
      phongBanOptions = groupUser.map((group) => {
        return <Option value={group.ma_pb} key={group.ma_pb}>{group.name}</Option>
      });
    }
    
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem
          {...formItemLayout}
          label={(
            <span>
              Tên đăng nhập&nbsp;
              <Tooltip title="Dùng để đăng nhập hệ thống!">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          )}
        >
          {getFieldDecorator('username', {
            initialValue: user.username,
            rules: [{ required: true, message: 'Hãy nhập tên đăng nhập!', whitespace: true }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="E-mail"
        >
          {getFieldDecorator('email', {
            initialValue: user.email,
            rules: [{
              type: 'email', message: 'Email không hợp lệ!',
            }, {
              required: true, message: 'Hãy nhập E-mail!',
            }],
          })(
            <Input />
          )}
        </FormItem>
        {!user.id ? 
          <React.Fragment>
            <FormItem
              {...formItemLayout}
              label="Mật khẩu"
            >
              {getFieldDecorator('hash', {
                rules: [{
                  required: true, message: 'Nhãy nhập mật khẩu!',
                }, {
                  validator: this.validateToNextPassword,
                }],
              })(
                <Input type="password" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Nhập lại mật khẩu"
            >
              {getFieldDecorator('confirm', {
                rules: [{
                  required: true, message: 'Nhập lại mật khẩu!',
                }, {
                  validator: this.compareToFirstPassword,
                }],
              })(
                <Input type="password" onBlur={this.handleConfirmBlur} />
              )}
            </FormItem>
          </React.Fragment>
          : 
          <React.Fragment>
            <FormItem
              {...formItemLayout}
              label="Mật khẩu mới"
            >
              {getFieldDecorator('hash', {
                rules: [{
                  required: false, message: 'Nhãy nhập mật khẩu!',
                }, {
                  validator: this.validateToNextPassword,
                }],
              })(
                <Input type="password" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Nhập lại mật khẩu mới"
            >
              {getFieldDecorator('confirm', {
                rules: [{
                  required: false, message: 'Nhập lại mật khẩu!',
                }, {
                  validator: this.compareToFirstPassword,
                }],
              })(
                <Input type="password" onBlur={this.handleConfirmBlur} />
              )}
            </FormItem>
          </React.Fragment>
          }
        <FormItem
          {...formItemLayout}
          label="Họ và tên"
        >
          {getFieldDecorator('name', {
            initialValue: user.name
          })(
            <Input style={{ width: '100%' }} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Mã nhân sự"
        >
          {getFieldDecorator('ma_ns', {
            initialValue: user.ma_ns
          })(
            <Input style={{ width: '100%' }} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Điện thoại"
        >
          {getFieldDecorator('phone', {
            initialValue: user.phone
          })(
            <Input style={{ width: '100%' }} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Phòng ban"
        >
          {getFieldDecorator('group_user', {
            initialValue: user.group_user,
            rules: [{ required: false, message: 'Hãy chọn phòng ban!' }],
          })(
            <Select 
              placeholder="Chọn phòng ban"
              onChange={(value) => {
                console.log(value);
              }}
            >
             {phongBanOptions}
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Tổ"
        >
          {getFieldDecorator('to_hanh_chinh', {
            initialValue: user.to_hanh_chinh
          })(
            <Input style={{ width: '100%' }} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Thông tin"
        >
          {getFieldDecorator('description', {
            initialValue: user.description
          })(
            <Input style={{ width: '100%' }} />
          )}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">Lưu</Button>
        </FormItem>
      </Form>
    );
  }
}

const WrappedRegistrationForm = Form.create()(RegistrationForm);

export default WrappedRegistrationForm;