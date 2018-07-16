import React from 'react'
import moment from 'moment';
import { Form, Select, Input, Row, Col, DatePicker, Button,Popconfirm,message } from 'antd';
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
              onChange={(e) => { console.log(e)
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
      </Form>
    );
  }
}

export default FormNote;