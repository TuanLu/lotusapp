import React from 'react'
import { 
  Table, Input, Select, Icon,
  Popconfirm, Form, Row, Modal,
  Col, Button, message
} from 'antd';
import { getTokenHeader , convertArrayObjectToObject} from 'ISD_API';
import {updateStateData} from 'actions'
import moment from 'moment'
import NoteForm from './QuanlyNote/NoteForm'
const FormItem = Form.Item;

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      data: [], 
      editingKey: '',
      newitem: 0
    }; 
    let {ans_language} = this.props.mainState;
    this.columns = [
      {
        title: ans_language.ans_date_create || 'ans_date_create',
        dataIndex: 'create_on',
        width: '120px',
        editable: false,
        required: true,
        render: (text) => text ? moment(text).format('DD/MM/YYYY') : ''
      },
      {
        title: ans_language.ans_create_by || 'ans_create_by',
        dataIndex: 'name',
        width: 150,
        editable: true,
        required: true,
        render: (text, record) => record.name || text
      },
      {
        title: ans_language.ans_titles || 'ans_titles',
        dataIndex: 'titles',
        width: '20%',
        editable: true,
        required: true
      },
      {
        title: ans_language.ans_assign_user || 'ans_assign_user',
        dataIndex: 'assign_users',
        //width: '40%',
        editable: true,
        required: true,
        render: (text) => {
          let userinfo = text ? text.split(',') : []; 
          let assign_users = '';
          let {userlist} = this.props.mainState; 
          if(userinfo.indexOf('all') !== -1) {
            assign_users = ans_language.ans_assign_all_ppls || 'ans_assign_all_ppls';
          }else{
            if(userinfo.length > 1) {
              let userinfo_join = userinfo.map((user) => {
                if(userlist[user]) {
                  return userlist[user].name || userlist[user].username; 
                }
                return ''
              })
              assign_users = userinfo_join.join(' , ');
            }
          }
          return (
            <div>
              {assign_users}
            </div>
          )
        }
      },
      {
        title: ans_language.ans_assign_group || 'ans_assign_group',
        dataIndex: 'assign_group',
        //width: '40%',
        editable: true,
        required: true,
        render: (text) => {
          let groupinfo = text ? text.split(',') : []; 
          let assign_group = '';
          let {grouplist} = this.props.mainState; 
          if(groupinfo.indexOf('all') !== -1) {
            assign_group = ans_language.ans_assign_all_group || 'ans_assign_all_group';
          }else{
            if(groupinfo.length > 1) {
              groupinfo = groupinfo.map((group) => {
                if(grouplist[group]) {
                  return grouplist[group].name; 
                }
                return ''
              })
              assign_group = groupinfo.join(' , ');
            }
          }
          return (
            <div>
              {assign_group}
            </div>
          )
        }
      },
      {
        title: ans_language.ans_actions || 'ans_actions',
        dataIndex: 'operation',
        width: '150px',
        render: (text, record) => {
          return (
            <div style={{minWidth: 100}}>
              <a href="javascript:;" onClick={() => this.edit(record)}><Icon type="edit" />{ans_language.ans_edit || 'ans_edit'}</a>  
              {/* {" | "}
              <Popconfirm
                title= {ans_language.ans_confirm_delete_alert || "ans_confirm_delete_alert" } 
                okType="danger"
                onConfirm={() => this.delete(record)}
              >
                <a href="javascript:;"><Icon type="delete" />{ans_language.ans_delete || 'ans_delete'}</a>  
              </Popconfirm> */}
            </div>
          );
        },
      },
    ];
  }
  addNewRow() {
    let rowItem = this.getDefaultFields();
    this.edit(rowItem);
  }
  getDefaultFields() {
    return {
      name: "",
      description: ""
    };
  }
  
  edit(record) {
    this.props.dispatch(updateStateData({ // Thay đổi mainState cần action
      systemNote: {
        ...record, // Tách object thành các thuộc tính của systemNote (ES6) 
        openModal: true
      }
    }));
  }
  delete = (record) => {
    if(record.id) {
      fetch(ISD_BASE_URL + 'note/deleteNote/' + record.id, {
        headers: getTokenHeader()
      })
      .then((response) => response.json())
      .then((json) => {
        if(json.status == 'error') {
          message.error(json.message, 3);
        } else {
          let newData = this.state.data.filter((item) => item.id != json.data);
          this.setState({data: newData});
          message.success(json.message);
          this.state.newitem = 0;
        }
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra khi xoá dữ liệu kho!', 3);
        console.log(error);
      });
    } else {
      if(record.key) {
        let newData = this.state.data.filter((item) => item.key != record.key);
        this.setState({
          data: newData
        })
      }  
    }
  }
  fetchData() {
    fetch(ISD_BASE_URL + 'note/fetchNote', {
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
          //Add key prop for table
          let data = json.data.map((item, index) => ({...item, key: index}) );
          this.setState({data});
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu dữ liệu danh mục!', 3);
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
        //Chi connect den server 1 lan
        this.props.dispatch(updateStateData({
          userlist: convertArrayObjectToObject(json.data, 'id')
        }));
      } else {
        console.warn(json.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }
  fetchGroupList() {
    fetch(ISD_BASE_URL + 'qlpb/fetchPb', {
      headers: getTokenHeader()
    })
    .then((response) => response.json())
    .then((json) => {
      if(json.data) {
        //Chi connect den server 1 lan
        this.props.dispatch(updateStateData({
          grouplist: convertArrayObjectToObject(json.data, 'ma_pb')
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
    let {mainState} = this.props;
    this.fetchData();
    let userlist = mainState.userlist;
    if(userlist.length == 0){
      this.fetchUserList();
    }
    let grouplist = mainState.grouplist || [];
    if(grouplist.length == 0){
      this.fetchGroupList();
    }
  }
  render() {
    const columns = this.columns;
    let {mainState} = this.props;
    let openModal = mainState.systemNote ? mainState.systemNote.openModal : false;
    let {ans_language} = mainState;
    return (
      <React.Fragment>
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">{ans_language.ans_note_main_title || 'ans_note_main_title'}</h2>
            </Col>
            <Col span={12}>
              <div className="action-btns">
                <Button 
                  onClick={() => this.addNewRow()}
                  type="primary" icon="plus">{ans_language.ans_add_new || 'ans_add_new'}</Button>
              </div>
            </Col>
          </Row>
        </div>
        {openModal?
          <Modal
            width={"80%"}
            style={{top: 20}}
            title={ans_language.ans_add_new_note || 'ans_add_new_note'}
            visible={openModal}
            onCancel={() => {
              this.props.dispatch(updateStateData({
                systemNote: {
                  ...this.props.mainState.systemNote,
                  openModal: false
                }
              }));
            }}
            onOk={() => {
              
            }}
            footer={null}
            >
            {/* Call form Create or Edit Note */}
            <NoteForm onDone={() => this.fetchData()} mainState={this.props.mainState} dispatch={this.props.dispatch} />
          </Modal>  
        : null}
        <Table
          bordered
          dataSource={this.state.data}
          columns={columns}
          rowClassName="editable-row"
        />
      </React.Fragment>
    );
  }
}

export default EditableTable