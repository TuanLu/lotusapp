import React from 'react'
import { Button } from 'antd';
import {updateStateData} from 'actions'

class UserInfo extends React.Component {
  showUserName() {
    let {userInfo} = this.props.mainState;
    if(userInfo) {
      return userInfo.name || userInfo.username || userInfo.email;
    }
  }
  render() {
    
    return (
      <div className="admin-user-info">
        <span>Xin chao, <b>{this.showUserName()}</b></span>
        <Button 
          onClick={()=> {
            this.props.dispatch(updateStateData({
              showLogin: true
            }));
          }}
          type="primary" ghost>Logout</Button>
      </div>
    );
  }
}

export default UserInfo