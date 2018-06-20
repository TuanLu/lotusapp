import React from 'react'
import { Menu, Icon, Button } from 'antd';
import {updateStateData} from 'actions'

const SubMenu = Menu.SubMenu;

class SidebarMenu extends React.Component {
  renderMenuItem() {
    let {mainState} = this.props;
    let {defaultRouter} = mainState;
    let menuItems = mainState.userRoles.filter((role) => role.include_in_menu !== false);
    menuItems = menuItems.map((role, index) => {
      return (
        <Menu.Item
          onClick={() => {
            this.props.dispatch(updateStateData({
              defaultRouter: role.path
            }));
          }} 
          key={role.path}>
            <Icon type={role.icon} />
            <span>{role.label}</span>
        </Menu.Item>
      );
    });
    return menuItems;
  }
  render() {
    let {defaultRouter} = this.props.mainState;
    return (
      <div>
        <Menu
          defaultSelectedKeys={[defaultRouter]}
          mode="inline"
          theme="dark"
        >
         {this.renderMenuItem()}
        </Menu>
      </div>
    );
  }
}

export default SidebarMenu