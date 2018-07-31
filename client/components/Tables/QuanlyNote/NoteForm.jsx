import React from 'react'
import {updateStateData} from 'actions'
import { Form, Input, Tooltip, Icon, Select, Row, Col, Checkbox, Button, message } from 'antd';
import {getTokenHeader} from 'ISD_API'

const FormItem = Form.Item;
const Option = Select.Option;

class NoteForm extends React.Component {
  state = {
    confirmDirty: false,
    groupUser: []
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        //Get USER ID from mainstate
        let {systemNote} = this.props.mainState;
        values.id = systemNote.id ? systemNote.id : '';
        fetch(ISD_BASE_URL + 'note/updateNote', {
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
          }
        }).catch((ex) => {
          console.log('parsing failed', ex)
          message.error('Có lỗi xảy ra trong quá trình thêm ghi chú!');
        });
      }
    });
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
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
  fetchUserList() {
    fetch(ISD_BASE_URL + 'users/fetchUsers', {
      headers: getTokenHeader()
    })
    .then((response) => response.json())
    .then((json) => {
      if(json.data) {
        this.setState({
          userlist: json.data
        });
        //Chi connect den server 1 lan
        this.props.dispatch(updateStateData({
          userlist: json.data
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
    let {userlist} = this.props.mainState; 
    if(!userlist || !userlist.length) {
      this.fetchUserList();
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

    let {systemNote, groupUser, ans_language, defaultLang, userlist} = this.props.mainState;
    let phongBanOptions = [];
    let usersOptions = [];
    //let {groupUser} = this.state;
    if(groupUser && groupUser.length) {
      phongBanOptions = groupUser.map((group) => {
        return <Option value={group.ma_pb} key={group.ma_pb}>{group.ma_pb} - {group.name}</Option>
      });
    }
    if(userlist && userlist.length) {
      usersOptions = userlist.map((user) => {
        return <Option value={user.id} key={user.id}>{user.name}</Option>
      });
    }
    let selected_user = [];
    if( systemNote.assign_users
      && systemNote.assign_users != "") {
        if(typeof systemNote.assign_users == "string") {
          selected_user = systemNote.assign_users.split(',')
        } else {
          selected_user = systemNote.assign_users;
        }
    }
    let selected_group = [];
    if( systemNote.assign_group
      && systemNote.assign_group != "") {
        if(typeof systemNote.assign_group == "string") {
          selected_group = systemNote.assign_group.split(',')
        } else {
          selected_group = systemNote.assign_group;
        }
    }
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem
          {...formItemLayout}
          label={(
            <span>
              Tiêu đề : &nbsp;
              <Tooltip title="Tiêu đề ghi chú">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          )}
        >
          {getFieldDecorator('titles', {
            initialValue: systemNote.titles,
            rules: [{ required: true, message: 'Hãy nhập tiêu đề!', whitespace: true }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Nội dung"
        >
          {getFieldDecorator('note', {
            initialValue: systemNote.note
          })(
            <Input.TextArea style={{ width: '100%' }} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Người nhận ghi chú"
        >
          {getFieldDecorator('assign_users', {
            initialValue: selected_user
          })(
            <Select 
              placeholder="Chọn người dùng"
              mode="multiple"
              onChange={(value) => {
                console.log(value);
              }}
            >
             {usersOptions}
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Phòng ban nhận ghi chú"
        >
          {getFieldDecorator('assign_group', {
            initialValue: selected_group,
            rules: [{ required: false, message: 'Hãy chọn phòng ban!' }],
          })(
            <Select 
              placeholder="Chọn phòng ban"
              mode="multiple"
              onChange={(value) => {
                console.log(value);
              }}
            >
             {phongBanOptions}
            </Select>
          )}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">{ans_language.ans_save || "Lưu"}</Button>
        </FormItem>
      </Form>
    );
  }  
}

const WrappedNoteForm = Form.create()(NoteForm);

export default WrappedNoteForm;