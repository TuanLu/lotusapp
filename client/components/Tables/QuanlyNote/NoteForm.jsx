import React from 'react'
import {updateStateData} from 'actions'
import { Form, Input, Tooltip, Icon, Select, Row, Col, Checkbox, Button, Upload, message } from 'antd';
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
            this.props.dispatch(updateStateData({ 
              systemNote: {
                //...record, 
                refresh: true,
                openModal: false
              }
            }));
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
  normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
  render() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        // xs: { span: 24 },
        // sm: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
    };
    const form50Layout = {
      labelCol: {
        // xs: { span: 24 },
        // sm: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 20 },
        sm: { span: 20 },
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

    let {systemNote, groupUser, ans_language, userlist} = this.props.mainState;
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
        <Row>
          <Col span="24">
            <FormItem
              {...formItemLayout}
              label={(
                <span>
                  {ans_language.ans_note_titles || 'ans_note_titles'} &nbsp;
                  <Tooltip title={ans_language.ans_note_titles_note || 'ans_note_titles_note' }>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              )}
            >
            {getFieldDecorator('titles', {
              initialValue: systemNote.titles,
              rules: [{ required: true, message: ans_language.ans_pls_enter_title || 'ans_pls_enter_title' , whitespace: true }],
            })(
              <Input />
            )}
          </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...form50Layout}
              label={ans_language.ans_group_assign || 'ans_group_assign'}
            > 
            {getFieldDecorator('assign_group', {
              initialValue: selected_group,
              rules: [{ required: false, message: ans_language.ans_choose_team || 'ans_choose_team' }],
            })(
              <Select 
                placeholder="Chọn phòng ban"
                mode="multiple"
                onChange={(value) => {
                  console.log(value);
                }}
              >
              <Option value="all">{ans_language.ans_all_team || 'ans_all_team' }</Option>
              {phongBanOptions}
              </Select>
            )}
          </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...form50Layout}
              label={ans_language.ans_user_assign || 'ans_user_assign'}
            >
              {getFieldDecorator('assign_users', {
                initialValue: selected_user
              })(
                <Select 
                  placeholder={ans_language.ans_user_assign_note || 'ans_user_assign_note'}
                  mode="multiple"
                  onChange={(value) => {
                    console.log(value);
                  }}
                >
                <Option value="all">{ans_language.ans_assign_all_user || 'ans_assign_all_user'}</Option>
                {usersOptions}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
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
          </Col>
          <Col span={24}>
            <FormItem
            {...formItemLayout}
            label="Upload"
            extra=""
            >
            {getFieldDecorator('upload', {
              valuePropName: 'fileList',
              getValueFromEvent: this.normFile,
            })( // Need function upload
              <Upload name="logo" action="/upload" listType="picture">
                <Button>
                  <Icon type="upload" /> {ans_language.ans_attach_file || 'ans_attach_file' }
                </Button>
              </Upload>
            )}
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
              <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">{ans_language.ans_send || 'ans_send'}</Button>
              </FormItem>
          </Col>
        </Row>
        </Form>
    );
  }  
}

const WrappedNoteForm = Form.create()(NoteForm);

export default WrappedNoteForm;