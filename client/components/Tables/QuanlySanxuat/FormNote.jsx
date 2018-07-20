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
  pheDuyet() {

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
    let gdact = sx && sx.gd == 0 ? false : true;
    let pkhsxact = sx && sx.pkhsx == 0 ? false : true;
    let pdbclact = sx && sx.pdbcl == 0 ? false : true;
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
                  defaultChecked = {pkhsxact}
                  checkedChildren="Đã ký"
                  unCheckedChildren="Chờ duyệt"
                  onChange={(pkhsx) => {
                    this.props.dispatch(updateStateData({
                      sx: {
                        ...this.props.mainState.sx,
                        pkhsx
                      }
                    }));
                  }}
                />
            </Col>
            <Col className="align_center" span={8}>
                  P. ĐBCL<br />
                  <Switch
                  disabled = {this.isNhomDBCL() ? false : true}
                  defaultChecked = {pdbclact}
                  checkedChildren="Đã ký"
                  unCheckedChildren="Chờ duyệt"
                  onChange={(pdbcl) => {
                    this.props.dispatch(updateStateData({
                      sx: {
                        ...this.props.mainState.sx,
                        pdbcl
                      }
                    }));
                  }}
                />
            </Col>
            <Col className="align_center" span={8}>
                  Giám Đốc<br />
                  <Switch
                  disabled = {this.isNhomGD() ? false : true}
                  defaultChecked = {gdact}
                  checkedChildren="Đã ký"
                  unCheckedChildren="Chờ duyệt"
                  onChange={(gd) => {
                    this.props.dispatch(updateStateData({
                      sx: {
                        ...this.props.mainState.sx,
                        gd
                      }
                    }));
                  }}
                />
            </Col>
          </Row>
      </Form>
    );
  }
}

export default FormNote;