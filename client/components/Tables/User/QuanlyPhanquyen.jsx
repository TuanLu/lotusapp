import React from 'react'
import { 
  Table, Input, Select, Switch,
  Popconfirm, Form, Row, 
  Col, Button, message
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject} from 'ISD_API'
import {updateStateData} from 'actions'

class UserPermission extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      data: [],
      loading: false
    };
    this.updateUserPermission = this.updateUserPermission.bind(this);
    this.columns = [
      {
        title: 'Tên module',
        dataIndex: 'name',
        width: "40%"
      },
      {
        title: 'Quyền xem',
        dataIndex: 'view',
        width: "15%",
        render: (text, record) => {
          if(record && record.permission && record.permission.view) {
            return (
              <Switch
                onChange={(value) => {                  
                  this.updateUserPermission(record.permission.view, value);
                }} 
                checked={text == "1" ? true : false} 
                checkedChildren="Có quyền" 
                unCheckedChildren={record.permission.view} />
            )
          }
        }
      },
      {
        title: 'Quyền thêm',
        dataIndex: 'add',
        width: "15%",
        render: (text, record) => {
          if(record && record.permission && record.permission.add) {
            return (
              <Switch checked={text == "1" ? true : false} checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />
            )
          }
        }
      },
      {
        title: 'Quyền sửa',
        dataIndex: 'edit',
        width: "15%",
        render: (text, record) => {
          if(record && record.permission && record.permission.edit) {
            return (
              <Switch checked={text == "1" ? true : false} checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />
            )
          }
        }
      },
      {
        title: 'Quyền xóa',
        dataIndex: 'delete',
        width: "15%",
        render: (text, record) => {
          render: (text, record) => {
            if(record && record.permission && record.permission.delete) {
              return (
                <Switch checked={text == "1" ? true : false} checkedChildren="Có quyền" unCheckedChildren="Không có quyền" />
              )
            }
          }
        }
      }
    ];
  }
  updateUserPermission(router_name, allow) {
    if(router_name) {
      let {mainState} = this.props;
      let userId = mainState.phanquyen && mainState.phanquyen.user ? mainState.phanquyen.user.id : '';
      if(userId) {
        let permissionData = {
          user_id: userId,
          router_name,
          allow,
          include: ''
        };
        fetch(ISD_BASE_URL + 'users/updatePermission', {
          method: 'POST',
          headers: getTokenHeader(),
          body: JSON.stringify(permissionData)
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
          message.error('Có lỗi xảy ra trong quá trình phân quyền!');
        });
      }
    }
  }
  fetchData() {
    this.setState({loading: true});
    fetch(ISD_BASE_URL + 'fetchAllRoles')
    .then((response) => response.json())
    .then((json) => {
      if(json.data) {
        // this.props.dispatch(updateStateData({
        //   allUserRoles: json.data
        // }));
        this.setState({
          data: json.data,
          loading: false
        })
      } else {
        message.error(json.message);
        this.setState({loading: false});
      }
    })
    .catch((error) => {
      this.setState({loading: false});
      message.error(error);
    });
  }
  componentDidMount() {
    this.fetchData();
  }
  render() {
    const columns = this.columns;

    return (
      <React.Fragment>
        <Table
          size="small"
          loading={this.state.loading}
          bordered
          dataSource={this.state.data}
          scroll={{ y: 300 }}
          pagination={{ pageSize: 50 }}
          columns={columns}
        />
      </React.Fragment>
    );
  }
}

export default UserPermission