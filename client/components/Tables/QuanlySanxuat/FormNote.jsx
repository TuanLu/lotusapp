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
    this.isNhomKHSX = this.isNhomKHSX.bind(this);
    this.isNhomDBCL = this.isNhomDBCL.bind(this);
    this.isNhomGD = this.isNhomGD.bind(this);
    this.state = {
      productListbyCateList: []
    }
  }
  pheDuyet(type, value) {
    this.setState({ loading: true });
    let {sx} = this.props.mainState;
    let pheDuyetData = {
      type,
      value,
      ma_sx: sx.ma_sx
    };
    fetch(ISD_BASE_URL + 'sx/pheduyet', {
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
          sx: {
            ...this.props.mainState.sx,
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
  isNhomKHSX() {
    let {userInfo} = this.props.mainState;
    let roles = userInfo.roles ? userInfo.roles.split(',') : [];     
    return roles.indexOf('duyet_khsx') !== -1;
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
    let {sx, phieuAction} = this.props.mainState; 
    let readOnly = false;//Read by roles
    return ( 
      <Form> 
        <Row>
          <Col span={24}>
            <FormItem
              label={'GHI CHÚ'}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
            <Input.TextArea 
              rows={4} 
              readOnly={readOnly}
              onChange={(e) => {
                this.props.dispatch(updateStateData({
                  sx: {
                    ...this.props.mainState.sx,
                    note: e.target.value
                  }
                }));
              }}
              placeholder="Hãy nhập ghi chú ở đây" autosize={{ minRows: 6}}
              defaultValue={sx.note}
            />
            </FormItem>
            </Col>
        </Row>
        <Row>
            <Col className="align_center" span={8}>
                <label>P. KHSX</label><br />
                  <Switch
                  disabled = {this.isNhomKHSX() ? false : true}
                  checked = {sx.pkhsx ? true : false}
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
                  disabled = {this.isNhomDBCL() ? false : true}
                  checked = {sx.pdbcl? true : false}
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
                  disabled = {this.isNhomGD() ? false : true}
                  checked = {sx.gd? true : false}
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