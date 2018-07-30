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
        <span>Xin chào, <b>{this.showUserName()}</b></span>
        <Button 
          style={{marginRight: 10}}
          //onClick={() => this.addNewRow()}
          type="primary" icon="mail">Góp ý, phản hồi</Button>
        <Button 
          onClick={()=> {
            this.props.dispatch(updateStateData({
              showLogin: true
            }));
          }}
          type="primary" ghost>Đăng xuất</Button>
      </div>
    );
  }
}

export default UserInfo