import React from 'react'
import { 
  Table, Input, Select, Switch,
  Popconfirm, Form, Row, 
  Col, Button, message
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject} from 'ISD_API'
import {updateStateData} from 'actions'

const allowLabel = "Có";
const denyLabel = "Không";

class UserPermission extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      data: [],
      permission: [],
      allowed_router: [],
      loading: false
    };
    this.updateUserPermission = this.updateUserPermission.bind(this);
    this.showRouterAndPermission = this.showRouterAndPermission.bind(this);
    this.columns = [
      {
        title: 'Tên module',
        dataIndex: 'name',
        width: "40%"
      },
      {
        title: 'Quyền xem',
        dataIndex: 'view',
        width: "10%",
        render: (text, record) => {
          if(record && record.permission && record.permission.view) {
            return (
              <Switch
                onChange={(value) => {                  
                  this.updateUserPermission(record.permission.view, value);
                }} 
                checked={this.state.allowed_router.indexOf(record.permission.view) !== -1 ? true : false} 
                checkedChildren={allowLabel}
                unCheckedChildren={denyLabel} />
            )
          }
        }
      },
      {
        title: 'Quyền thêm',
        dataIndex: 'add',
        width: "10%",
        render: (text, record) => {
          if(record && record.permission && record.permission.add) {
            return (
              <Switch 
                onChange={(value) => {                  
                  this.updateUserPermission(record.permission.add, value);
                }}
                checked={this.state.allowed_router.indexOf(record.permission.add) !== -1 ? true : false}
                checkedChildren={allowLabel} 
                unCheckedChildren={denyLabel} />
            )
          }
        }
      },
      {
        title: 'Quyền sửa',
        dataIndex: 'edit',
        width: "10%",
        render: (text, record) => {
          if(record && record.permission && record.permission.edit) {
            return (
              <Switch 
                onChange={(value) => {                  
                  this.updateUserPermission(record.permission.edit, value);
                }}
                checked={this.state.allowed_router.indexOf(record.permission.edit) !== -1 ? true : false} 
                checkedChildren={allowLabel} 
                unCheckedChildren={denyLabel} />
            )
          }
        }
      },
      {
        title: 'Quyền xóa',
        dataIndex: 'delete',
        width: "10%",
        render: (text, record) => {
          if(record && record.permission && record.permission.delete) {
            return (
              <Switch 
                onChange={(value) => {                  
                  this.updateUserPermission(record.permission.delete, value);
                }}
                checked={this.state.allowed_router.indexOf(record.permission.delete) !== -1 ? true : false} 
                checkedChildren={allowLabel} 
                unCheckedChildren={denyLabel} />
            )
          }
        } 
      },
      {
        title: 'Bao gồm',
        dataIndex: 'include',
        width: "20%",
        render: (text, record) => {
          // console.log(record.include);
          // return (
          //   <div>Include List</div>
          // );
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
            this.showRouterAndPermission(json.data);
            message.success(json.message);
          }
        }).catch((ex) => {
          console.log('parsing failed', ex)
          message.error('Có lỗi xảy ra trong quá trình phân quyền!');
        });
      }
    }
  }
  showRouterAndPermission(data) {
    if(data.permission && data.roles) {
      let allowedRouter = data.permission.map((router) => router.router_name);
      this.setState({
        data: data.roles,
        permission: data.permission,
        loading: false,
        allowed_router: allowedRouter
      })
    }
  }
  fetchData() {
    let {phanquyen} = this.props.mainState;
    let userId = phanquyen.user ? phanquyen.user.id : '';
    this.setState({loading: true});
    fetch(ISD_BASE_URL + 'fetchAllRoles/' + userId, {
      headers: getTokenHeader()
    })
    .then((response) => response.json())
    .then((json) => {
      if(json.data) {
        this.showRouterAndPermission(json.data);
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