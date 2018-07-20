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
    this.state = {
      productListbyCateList: []
    }
  }
  componentDidMount() {
    
  }
  render() {
    let {sx, phieuAction} = this.props.mainState; 
    let readOnly = phieuAction && phieuAction.action == 'view' ? true : false;
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
                  disabled = {readOnly}
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
                  disabled = {readOnly}
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
                  disabled = {readOnly}
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