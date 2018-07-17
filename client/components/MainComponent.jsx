import React from 'react'
import {connect} from 'react-redux'
import { Layout, Menu, Icon, Button, message } from 'antd';
const { Header, Sider, Content } = Layout;
import { Row, Col } from 'antd';
import SidebarMenu from './SidebarMenu'
import QuanlyNPP from './Tables/QuanlyNPP'
import UserManagement from './Tables/UserManagement'
import LoginForm from './LoginForm'
import UserInfo from './UserInfo'
import {getTokenHeader} from 'ISD_API'
import {updateStateData} from 'actions'
import Loading from './Loading'
import QuanlyKho from './Tables/QuanlyKho'
import QuanlyVtkho from './Tables/QuanlyVtkho'
import QuanlyCat from './Tables/QuanlyCate'
import QuanlyKh from './Tables/QuanlyKh'
import QuanlySanpham from './Tables/QuanlySanpham'
import QuanlySanxuat from './Tables/QuanlySanxuat'
import QuanlyPhieunhap from './Tables/QuanlyPhieunhap'
import QuanlyPhieuxuat from './Tables/QuanlyPhieuxuat'
import QuanlyDonhang from './Tables/QuanlyDonhang'
import QuanlyTinhTrangKho from './Tables/QuanlyTinhTrangKho'
import QuanlyNhansu from './Tables/QuanlyNhansu'
import QuanlyJobs from './Tables/QuanlyJobs'
import QuanlyPhongban from './Tables/QuanlyPhongban'
import QuanlySanluong from './Tables/QuanlySanluong'
import QuanlyChuyendoicong from './Tables/QuanlyChuyendoicong';

class MainComponent extends React.Component {
  state = {
    collapsed: false,
    logged: false,
    loading: true
  };
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  componentWillMount() {
    let {mainState} = this.props;
    if(!mainState.userInfo) {
      let token = sessionStorage.getItem('ISD_TOKEN');
      if(token != "" && token != null) {
        fetch(ISD_BASE_URL + 'fetchRoles', {
          headers: getTokenHeader()   
        })
        .then((response) => response.json())
        .then((json) => {
          if(json.userInfo) {
            this.props.dispatch(updateStateData({
              showLogin: false,
              userRoles: json.scopes,
              defaultRouter: json.scopes[0] && json.scopes[0]['path'] ? json.scopes[0]['path'] : '',
              userInfo: json.userInfo
            }));
          } else if(json.status == "error") {
            message.error(json.message, 3);
          }
          this.setState({
            loading: false
          })
        })
        .catch((error) => {
          console.warn(error);
          this.setState({
            loading: false
          })
        });
      } else {
        this.setState({
          loading: false
        })
      }
    } else {
      this.props.dispatch(updateStateData({
        defaultRouter: mainState.defaultRouter
      }));
    }
  }
  renderContent(router) {
    let {dispatch, mainState} = this.props;
    switch (router) {
      case 'qldh':
        return <QuanlyDonhang dispatch={dispatch} mainState={mainState}/>
        break;
      case 'npp':
        return <QuanlyNPP dispatch={dispatch} mainState={mainState}/>
        break;
      case 'qluser':
        return <UserManagement dispatch={dispatch} mainState={mainState}/>
        break;
      case 'qlkho':
        return <QuanlyKho dispatch={dispatch}/>
        break;
      case 'qlvtkho':
        return <QuanlyVtkho mainState={mainState} dispatch={dispatch}/>
        break;
      case 'qlsx':
        return <QuanlySanxuat mainState={mainState} dispatch={dispatch}/>
        break;
      case 'qlcate':
        return <QuanlyCat dispatch={dispatch}/>
        break;
      case 'product':
        return <QuanlySanpham dispatch={dispatch} mainState={mainState}/>
        break;
      case 'qlkh':
        return <QuanlyKh dispatch={dispatch}/>
        break;
      case 'qlphieunhap':
        return <QuanlyPhieunhap dispatch={dispatch} mainState={mainState}/>
        break;
      case 'qlphieuxuat':
        return <QuanlyPhieuxuat dispatch={dispatch} mainState={mainState}/>
        break;
      case 'tinhtrangkho':
        return <QuanlyTinhTrangKho dispatch={dispatch} mainState={mainState}/>
        break;
      case 'qlns':
          return <QuanlyNhansu dispatch={dispatch} mainState={mainState}/>
          break;
      case 'qljobs':
        return <QuanlyJobs dispatch={dispatch} mainState={mainState}/>
        break;
      case 'qlsl':
        return <QuanlySanluong dispatch={dispatch} mainState={mainState}/>
        break;
      case 'cdc':
        return <QuanlyChuyendoicong dispatch={dispatch} mainState={mainState}/>
        break;
      case 'qlpb':
        return <QuanlyPhongban dispatch={dispatch} mainState={mainState}/>
        break;
      default:
        break;
    }
  }
  render() {
    if(this.state.loading) {
      return <Loading/>
    }
    let {showLogin} = this.props.mainState; 
    if(showLogin) return  <LoginForm dispatch={this.props.dispatch}/>;
    let {defaultRouter} = this.props.mainState;
    return(
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
        >
          <div style={{color: '#fff', textAlign: 'center', padding: '10px 0'}} className="logo" >
            <img style={{width: '50%'}} src="./images/logo.png"/>
          </div>
          <SidebarMenu 
            mainState={this.props.mainState}
            dispatch={this.props.dispatch}/>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <Icon
              className="trigger"
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            <UserInfo 
              mainState={this.props.mainState}
              dispatch={this.props.dispatch}/>
          </Header>
          <div style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
            {!defaultRouter? 
              <Loading/>
              : 
              this.renderContent(defaultRouter)
            }
          </div>
        </Layout>
      </Layout>
    );
  }
}

export default connect((state) => {
  return {
    mainState: state.main.present,
  }
})(MainComponent)