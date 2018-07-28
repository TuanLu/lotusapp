import React from 'react'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message, Modal
} from 'antd';
import {getTokenHeader, statusOptions} from 'ISD_API'
import {updateStateData} from 'actions'
//import Roles from './User/Roles'
import UserForm from './User/UserForm'
import QuanlyPhanquyen from './User/QuanlyPhanquyen'

const FormItem = Form.Item;

class UserManage extends React.Component {
  constructor(props) {
    super(props);
    this.cancel = this.cancel.bind(this);
    this.state = { 
      data: [], 
    };
    this.columns = [
      {
        title: 'Tên đăng nhập',
        dataIndex: 'username',
        editable: true,
        //width: '12%',
        required: true
      },
      {
        title: 'Email',
        dataIndex: 'email', 
        editable: true,
        //width: '15%',
        required: true
      },
      // {
      //   title: 'Mật khẩu',
      //   dataIndex: 'hash',
      //   editable: true,
      //   width: '10%',
      //   required: false, //edit mode dont required
      //   render: (text, record) => {
      //     return 'Đã mã hoá';
      //   }
      // },
      {
        title: 'Họ và tên',
        dataIndex: 'name',
        editable: true,
        //width: '15%',
        required: false
      },
      // {
      //   title: 'Quyền',
      //   dataIndex: 'roles',
      //   width: '25%',
      //   editable: true,
      //   required: false
      // },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        editable: true,
        render: (text, record) => {
          let selectedOption = statusOptions.filter((option) => option.value == text);
          return <span>{selectedOption[0].text}</span>
        }
      },
      {
        title: 'Phân Quyền',
        dataIndex: 'phan_quyen',
        editable: false,
        required: false,
        width: 100,
        render: (text, record) => {
          if(!record.id) {
            return null;
          }
          return (
            <Button
              onClick={() => {
                this.props.dispatch(updateStateData({
                  phanquyen: {
                    user: record,
                    openModal: true
                  }
                }));
              }}
              type="primary">Phân quyền</Button>
          );
        }
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
      username: "",
      email: "",
      name: "",
      hash: "",
      status: "1",
      ma_ns: "",
      group_user: "",
      to_hanh_chinh: "",
      description: ""
    };
  }
  edit(record) {
    this.props.dispatch(updateStateData({
      user: {
        ...record,
        openUserModal: true
      }
    }));
  }
  cancel = () => {
    this.props.dispatch(updateStateData({
      user: {
        openUserModal: false
      }
    }));
  }
  delete = (record) => {
    if(record.id) {
      fetch(ISD_BASE_URL + 'users/deleteUser/' + record.id, {
        headers: getTokenHeader(),
      })
      .then((response) => response.json())
      .then((json) => {
        if(json.status == 'error') {
          message.error(response.message, 3);
        } else {
          let newData = this.state.data.filter((item) => item.id != json.data);
          this.setState({data: newData});
          message.success(json.message);
          this.state.newitem = 0;
        }
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra khi xoá user!', 3);
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
    fetch(ISD_BASE_URL + 'users/fetchUsers', {
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
      message.error('Có lỗi khi tải dữ liệu !', 3);
      console.log(error);
    }); 
  }
  componentDidMount() {
    this.fetchData();
  }
  render() {
    const columns = this.columns;
    let {mainState} = this.props;
    let openModal = mainState.phanquyen ? mainState.phanquyen.openModal : false;
    let openUserModal = mainState.user ? mainState.user.openUserModal : false;

    return (
      <React.Fragment>
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">Quản lý người dùng</h2>
            </Col>
            <Col span={12}>
              <div className="action-btns">
                <Button 
                  onClick={() => this.addNewRow()}
                  type="primary" icon="plus">Thêm mới người dùng</Button>
              </div>
            </Col>
          </Row>
        </div>
        {openModal? 
          <Modal
            width={"95%"}
            style={{top: 20}}
            title="Phân quyền người dùng"
            okText="Lưu"
            cancelText="Đóng"
            visible={openModal}
            onCancel={() => {
              this.props.dispatch(updateStateData({
                phanquyen: {
                  ...this.props.mainState.phanquyen,
                  openModal: false
                }
              }));
            }}
            onOk={() => {
              
            }}
            footer={null}
            >
            <QuanlyPhanquyen mainState={this.props.mainState} dispatch={this.props.dispatch} />
          </Modal>  
        : null}
        {openUserModal? 
          <Modal
            width={"60%"}
            style={{top: 20}}
            title="Form thành viên"
            visible={openUserModal}
            onCancel={() => {
              this.cancel();
            }}
            footer={null}
            >
            <UserForm 
              afterSave={(data) => {
                this.setState({data});
                this.cancel();
              }}
              mainState={this.props.mainState} 
              dispatch={this.props.dispatch}/>
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

export default UserManage