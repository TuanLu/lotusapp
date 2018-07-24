import React from 'react'
import { 
  Table, Input, Select, Switch,
  Popconfirm, Form, Row, 
  Col, Button, message
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject} from 'ISD_API'
import {updateStateData} from 'actions'

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const tableConfig = {
  headTitle: 'Quản lý phân quyền user',
  addNewTitle: 'Thêm mới'
};

const fetchConfig = {
  fetch: 'qlpq/fetch',
  update: 'qlpq/update',
  delete: 'qlpq/delete/'
}

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  getInput = () => {
    switch (this.props.inputType) {
      case 'user_id':
        let userlist = this.props.userlist || [];
        return (
          <Select 
            style={{ width: 250 }}
            placeholder="Chọn danh mục">
           {userlist.map((user) => {
              return <Select.Option 
              key={user.id} 
              value={user.id}>
                {user.name}
              </Select.Option>
           })}
          </Select>
        );
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
                    rules: [{
                      required: required,
                      message: `Hãy nhập dữ liệu ô ${title}!`,
                    }],
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
      userlist: {},
      newitem: 0
    };
    this.columns = [
      {
        title: 'Tên module',
        dataIndex: 'name',
        //width: '15%',
        editable: true,
        required: true
      },
      {
        title: 'Quyền xem',
        dataIndex: 'role_view',
        //width: '40%',
        editable: true,
      },
      {
        title: 'Quyền thêm',
        dataIndex: 'role_add',
        //width: '40%',
        editable: true,
      },
      {
        title: 'Quyền sửa',
        dataIndex: 'role_edit',
        //width: '40%',
        editable: true,
      },
      {
        title: 'Quyền xóa',
        dataIndex: 'role_delete',
        //width: '40%',
        editable: true,
      }
    ];
    this.state.data = [{
      key: 1,
      name: 'QL Kho hàng',
      role_add:     <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
      role_edit:    <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
      role_delete:  <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
      role_view:    <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
      children: [{
        key: 11,
        name: 'Kho Thành phẩm',
        role_add:     <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
        role_edit:    <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
        role_delete:  <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
        role_view:    <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
      }, {
        key: 12,
        name: 'Kho Bán Thành Phẩm',
        role_add:     <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
        role_edit:    <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
        role_delete:  <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
        role_view:    <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
      }],
    }, {
      key: 2,
      name: 'QL NPP',
      role_add:     <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
      role_edit:    <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
      role_delete:  <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
      role_view:    <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
    },
    {
      key: 13,
      name: 'QL Công việc ',
      role_add:     <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
      role_edit:    <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
      role_delete:  <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
      role_view:    <Switch checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />,
    }]
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
      this.state.newitem  = 1 ;
    }else{
      message.error('Bạn đang thêm mới quyền hạn rồi ...');
    }
  }
  getDefaultFields() {
    return {
      user_id: "",
      ma_role: "",
      role_add: "",
      role_edit: "",
      role_delete: "",
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
        fetch(ISD_BASE_URL + fetchConfig.update, {
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
      fetch(ISD_BASE_URL + fetchConfig.delete + record.id, {
        headers: getTokenHeader()
      })
      .then((response) => response.json())
      .then((json) => {
        if(json.status == 'error') {
          message.error('Có lỗi xảy ra khi xoá quyền hạn!', 3);
        } else {
          let newData = this.state.data.filter((item) => item.id != json.data);
          this.setState({data: newData});
          message.success(json.message);
          this.state.newitem = 0;
        }
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra khi xoá quyền hạn!', 3);
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
  fetchUsers() {
    fetch(ISD_BASE_URL + 'users/fetchUsers', {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            userlist: json.data
          }));
        }
      } else {
        message.error(json.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }
  fetchData() {
    fetch(ISD_BASE_URL + fetchConfig.fetch, {
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
      message.error('Có lỗi khi tải dữ liệu quyền hạn!', 3);
      console.log(error);
    }); 
  }
  componentDidMount() {
    this.fetchUsers();
    //this.fetchData();
  }
  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
   let userlist = this.props.mainState.userlist;
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
          required: col.required,
          userlist
        }),
      };
    });

    return (
      <React.Fragment>
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">{tableConfig.headTitle}</h2>
            </Col>
            <Col span={12}>
              <div className="action-btns">
                  <Select 
                    style={{ width: 250 }}
                    placeholder="Chọn user">
                    {userlist.map((user) => {
                        return <Select.Option 
                        key={user.id} 
                        value={user.id}>
                          {user.name}
                        </Select.Option>
                    })}
                  </Select>
              </div>
            </Col>
          </Row>
        </div>
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