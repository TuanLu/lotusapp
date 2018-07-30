import React from 'react'
import { Menu, Icon, Button } from 'antd';
import {updateStateData} from 'actions'

const SubMenu = Menu.SubMenu;

class SidebarMenu extends React.Component {
  renderMenuItem() {
    let {mainState} = this.props;
    let {defaultRouter} = mainState;
    let {language} = mainState;
    let menuItems = mainState.userRoles.filter((role) => role.include_in_menu !== false);
    menuItems = menuItems.map((role, index) => {
      if(role.children && role.children.length > 0) {
        return (
          <SubMenu key={role.path} title={
            <span><Icon className="menu_item_left_icon" type={role.icon} />
              {/*ANS_Q: Làm sao chèn biến language vào đây??? */}
              <span>{role.label}</span>
            </span>}> 
             {role.children.map((child) => {
              return (
                <Menu.Item className="menu_item_left"
                  onClick={() => {
                    this.props.dispatch(updateStateData({
                      defaultRouter: child.path
                    }));
                  }} 
                  key={child.path}>
                    {child.icon ? 
                      <Icon type={child.icon} />
                    : 
                    <Icon type="api" /> }
                    <span>{child.label}</span>
                </Menu.Item>
              );
            })}
          </SubMenu>
        );
      } else {
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
      }
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
         {/* <SubMenu key="user_group" title={<span><Icon type="team" /><span>QL Users</span></span>}>
            <Menu.Item key="5">Option 5</Menu.Item>
          </SubMenu>
          <SubMenu key="setting_group" title={<span><Icon type="setting" /><span>Cài đặt</span></span>}>
            <Menu.Item key="6">Option 6</Menu.Item>
            <Menu.Item key="7">Option 7</Menu.Item>
          </SubMenu>
          <SubMenu key="qlsx_group" title={<span><Icon type="trademark" /><span>QL SX</span></span>}>
            <Menu.Item key="8">Option 8</Menu.Item>
          </SubMenu> */}
        </Menu>
      </div>
    );
  }
}

export default SidebarMenu