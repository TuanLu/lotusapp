import React from 'react'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message, Modal
} from 'antd';
import {getTokenHeader, statusOptions} from 'ISD_API'
import {updateStateData} from 'actions'
import Roles from './User/Roles'
import QuanlyPhanquyen from './User/QuanlyPhanquyen'

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  getInput = () => {
    switch (this.props.inputType) {
      case 'status':
        return (
          <Select placeholder="Chọn xếp hạng">
            {statusOptions.map((option) => {
              return <Select.Option key={option.value} key={option.value}>{option.text}</Select.Option>
            })}
          </Select>
        );
        break;
      case 'hash':
      return <Input type="password" placeholder="Nhập mật khẩu" />;
        break;
      case 'roles':
        let roles = [];
        if(this.props.record 
          && this.props.record.roles
          && this.props.record.roles != "") {
          roles = this.props.record.roles.split(',')
        }
        return <Roles selectedRoles={roles}/>
        break;
      default:
        return <Input />;
        break;
    }
    
  };
  render() {
    const {
      editing,
      required,
      dataIndex,
      title,
      inputType,
      record,
      index,
      ...restProps
    } = this.props;
    return (
      <EditableContext.Consumer>
        {(form) => {
          const { getFieldDecorator } = form;
          return (
            <td {...restProps}>
              {editing ? (
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(dataIndex, {
                    rules: ((inputName) => {
                      let rules = [{
                        required: required,
                        message: `Hãy nhập dữ liệu ô ${title}!`,
                      }];
                      if(inputName == 'email') {
                        rules = [...rules, {
                          type: 'email', message: 'Email không hợp lệ',
                        }]
                      }
                      return rules;
                    })(dataIndex),
                    initialValue: record[dataIndex],
                    
                  })(this.getInput())}
                </FormItem>
              ) : restProps.children}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}

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
        title: 'Tên đăng nhập',
        dataIndex: 'username',
        editable: true,
        width: '12%',
        required: true
      },
      {
        title: 'Email',
        dataIndex: 'email', 
        editable: true,
        width: '15%',
        required: true
      },
      {
        title: 'Mật khẩu',
        dataIndex: 'hash',
        editable: true,
        width: '10%',
        required: false, //edit mode dont required
        render: (text, record) => {
          return 'Đã mã hoá';
        }
      },
      {
        title: 'Họ và tên',
        dataIndex: 'name',
        editable: true,
        width: '15%',
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
          const editable = this.isEditing(record);
          return (
            <div style={{minWidth: 100}}>
              {editable ? (
                <span>
                  <EditableContext.Consumer>
                    {form => (
                      <a
                        href="javascript:;"
                        onClick={() => this.save(form, record.key)}
                        style={{ marginRight: 8 }}
                      >
                        Lưu
                      </a>
                    )}
                  </EditableContext.Consumer>
                  <Popconfirm
                    title="Bạn thật sự muốn huỷ?"
                    onConfirm={() => this.cancel(record)}
                  >
                    <a href="javascript:;"> {" | "}Huỷ</a>
                  </Popconfirm>
                </span>
              ) : (
                <React.Fragment>
                  <a href="javascript:;" onClick={() => this.edit(record.key)}>Sửa</a>  
                  {" | "}
                  <Popconfirm
                    title="Bạn thật sự muốn xoá?"
                    okType="danger"
                    onConfirm={() => this.delete(record)}
                  >
                    <a href="javascript:;">Xoá</a>  
                  </Popconfirm>
                </React.Fragment>
                
              )}
            </div>
          );
        },
      },
    ];
  }
  addNewRow() {
    if(this.state.newitem == 0){
      let rowItem = this.getDefaultFields();
      rowItem = {
        ...rowItem,
        key: this.state.data.length + 1
      };
      this.setState({
        data: [rowItem, ...this.state.data],
        editingKey: rowItem.key
      })
      this.state.newitem = 1;
    }else{
      message.error('Bạn đang thêm mới người dùng rồi ...');
    }
  }
  getDefaultFields() {
    return {
      username: "",
      email: "",
      name: "",
      hash: "",
      status: "1",
      roles: []
    };
  }
  isEditing = (record) => {
    return record.key === this.state.editingKey;
  };
  edit(key) {
    this.setState({ editingKey: key });
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
        fetch(ISD_BASE_URL + 'users/updateUser', {
          method: 'POST',
          headers: getTokenHeader(),
          body: JSON.stringify(newItemData)
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
            //udate table state
            newData.splice(index, 1, {
              ...newItemData,
              ...json.data
            });
            this.setState({ data: newData, editingKey: '' });
            message.success(json.message);
            this.state.newitem = 0;
            window.location.reload();
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
    this.setState({ editingKey: '' });
    if(this.state.newitem == 1){
      this.state.newitem = 0;
      this.delete(record);
    }
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
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.dataIndex,
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
          required: col.required
        }),
      };
    });
    let {mainState} = this.props;
    let openModal = mainState.phanquyen ? mainState.phanquyen.openModal : false;

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
        <Table
          components={components}
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