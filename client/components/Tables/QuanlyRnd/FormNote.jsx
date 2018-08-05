import React from 'react'
import moment from 'moment';
import { Form, Select, Input, Row, Col,Switch, DatePicker, Button,Popconfirm,message } from 'antd';
import {updateStateData} from 'actions'
import {getTokenHeader, trangThaiPhieu} from 'ISD_API'
const FormItem = Form.Item;
const Option = Select.Option;
const dateFormat = 'YYYY/MM/DD';
const { TextArea } = Input;

class FormNote extends React.Component {
  constructor(props) {
    super(props);
    this.pheDuyet = this.pheDuyet.bind(this);
    this.isNhomRND = this.isNhomRND.bind(this);
    this.isNhomDBCL = this.isNhomDBCL.bind(this);
    this.isNhomGD = this.isNhomGD.bind(this);
    this.state = {
      productListbyCateList: []
    }
  }
  pheDuyet(type, value) {
    this.setState({ loading: true });
    let {rnd} = this.props.mainState;
    let pheDuyetData = {
      type,
      value,
      ma_nc: rnd.ma_nc
    };
    fetch(ISD_BASE_URL + 'rnd/pheduyet', {
      method: 'POST',
      headers: getTokenHeader(),
      body: JSON.stringify(pheDuyetData)
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
        this.props.dispatch(updateStateData({
          rnd: {
            ...this.props.mainState.rnd,
            refresh: true,
            ...json.data
          },
        }));
      }
    }).catch((ex) => {
      console.log('parsing failed', ex)
      message.error('Có lỗi xảy ra trong quá trình phê duyệt!');
    });
  }
  componentDidMount() {
    
  }
  isNhomRND() {
    let {userInfo} = this.props.mainState;
    let roles = userInfo.roles ? userInfo.roles.split(',') : [];
    return roles.indexOf('duyet_rnd') !== -1;
  }
  isNhomDBCL() {
    let {userInfo} = this.props.mainState;
    let roles = userInfo.roles ? userInfo.roles.split(',') : [];     
    return roles.indexOf('duyet_dbcl') !== -1;
  }
  isNhomGD() {
    let {userInfo} = this.props.mainState;
    let roles = userInfo.roles ? userInfo.roles.split(',') : [];     
    return roles.indexOf('duyet_gd') !== -1;
  }
  render() {
    let {rnd, phieuAction, ans_language} = this.props.mainState; 
    let readOnly = false;//Read by roles
    return ( 
      <Form> 
        <Row>
          <Col span={24}>
            <FormItem
              label={ans_language.ans_note || 'ans_note'}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
            <Input.TextArea 
              rows={4} 
              readOnly={readOnly}
              onChange={(e) => {
                this.props.dispatch(updateStateData({
                  rnd: {
                    ...this.props.mainState.rnd,
                    note: e.target.value
                  }
                }));
              }}
              placeholder={ans_language.ans_add_note_here || 'ans_add_note_here'} autosize={{ minRows: 6}}
              defaultValue={rnd.note}
            />
            </FormItem>
            </Col>
        </Row>
        <Row>
            <Col className="align_center" span={8}>
                <label>P. RND</label><br />
                  <Switch
                  //disabled = {this.isNhomKHSX() ? false : true}
                  checked = {rnd.pkhsx ? true : false}
                  checkedChildren="Đã ký"
                  unCheckedChildren="Chờ duyệt"
                  onChange={(pkhsx) => {
                    this.pheDuyet('pkhsx', pkhsx);
                  }}
                />
            </Col>
            <Col className="align_center" span={8}>
                  P. ĐBCL<br />
                  <Switch
                  //disabled = {this.isNhomDBCL() ? false : true}
                  checked = {rnd.pdbcl? true : false}
                  checkedChildren="Đã ký"
                  unCheckedChildren="Chờ duyệt"
                  onChange={(pdbcl) => {
                    this.pheDuyet('pdbcl', pdbcl);
                  }}
                />
            </Col>
            <Col className="align_center" span={8}>
                  Giám Đốc<br />
                  <Switch
                  //disabled = {this.isNhomGD() ? false : true}
                  checked = {rnd.gd? true : false}
                  checkedChildren="Đã ký"
                  unCheckedChildren="Chờ duyệt"
                  onChange={(gd) => {
                    this.pheDuyet('gd', gd);
                  }}
                />
            </Col>
          </Row>
      </Form>
    );
  }
}

export default FormNote;