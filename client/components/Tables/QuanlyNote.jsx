import React from 'react'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row, Modal,
  Col, Button, message
} from 'antd';
import { getTokenHeader, ans_language } from 'ISD_API';
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
    this.columns = [
      {
        title: 'Ngày tạo',
        dataIndex: 'create_on',
        //width: '15%',
        editable: false,
        required: true,
        //render: {} Render phải return về cái gì đó
        render: (text, record) => text ? moment(text).format('DD/MM/YYYY') : ''
      },
      {
        title: 'Người tạo',
        dataIndex: 'create_by',
        //width: '40%',
        editable: true,
        required: true,
        //render: {}
      },
      {
        title: 'Tiêu đề',
        dataIndex: 'titles',
        //width: '40%',
        editable: true,
        required: true
      },
      {
        title: 'Nhân viên liên quan',
        dataIndex: 'assign_users',
        //width: '40%',
        editable: true,
        required: true,
        //render: {}
      },
      {
        title: 'Phòng liên quan',
        dataIndex: 'assign_group',
        //width: '40%',
        editable: true,
        required: true,
        //render: {}
      },
      {
        title: 'Actions',
        dataIndex: 'operation',
        render: (text, record) => {
          return (
            <div style={{minWidth: 100}}>
              <a href="javascript:;" onClick={() => this.edit(record)}>Sửa</a>  
              {" | "}
              <Popconfirm
                title="Bạn thật sự muốn xoá?"
                okType="danger"
                onConfirm={() => this.delete(record)}
              >
                <a href="javascript:;">Xoá</a>  
              </Popconfirm>
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
  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.state.data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        //console.log(item, row);//update to server here
        let newItemData = {
          ...item,
          ...row,
        };
        fetch(ISD_BASE_URL + 'note/updateNote', {
          method: 'POST',
          headers: getTokenHeader(),
          body: JSON.stringify(newItemData)
        })
        .then((response) => {
          return response.json()
        }).then((json) => {
          if(json.status == 'error') {
            message.error(json.message, 3);
          } else {
            //udate table state
            newData.splice(index, 1, {
              ...newItemData,
              ...json.data
            });
            this.setState({ data: newData, editingKey: '' });
            message.success(json.message);
            this.state.newitem = 0;
          }
        }).catch((ex) => {
          console.log('parsing failed', ex)
          message.error('Có lỗi xảy ra trong quá trình lưu hoặc chỉnh sửa!');
        });
        //End up data to server
      } else {
        newData.push(data);
        this.setState({ data: newData, editingKey: '' });
      }
    });
  }
  cancel = (record) => {
    
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
  componentDidMount() {
    this.fetchData();
  }
  render() {
    const columns = this.columns;
    let {mainState} = this.props;
    let openModal = mainState.systemNote ? mainState.systemNote.openModal : false;
    return (
      <React.Fragment>
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">Quản lý Thông báo</h2>
            </Col>
            <Col span={12}>
              <div className="action-btns">
                <Button 
                  onClick={() => this.addNewRow()}
                  type="primary" icon="plus">Thêm mới</Button>
              </div>
            </Col>
          </Row>
        </div>
        {openModal? 
          <Modal
            width={"95%"}
            style={{top: 20}}
            title="Tạo ghi chú cho phòng ban hoặc cá nhân"
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
            <NoteForm mainState={this.props.mainState} dispatch={this.props.dispatch} />
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