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
    let {language} = this.props.mainState; 
    return (
      <div className="admin-user-info">
        <span>{language.ans__xin_chao.vi} <b>{this.showUserName()}</b></span>
        <Button 
          onClick={()=> {
            this.props.dispatch(updateStateData({
              showLogin: true
            }));
          }}
          type="primary" ghost>{language.ans_dang_xuat.vi}</Button>
      </div>
    );
  }
}

export default UserInfo