import React from 'react'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message, Modal
} from 'antd';
import {getTokenHeader, statusOptions} from 'ISD_API'
import {updateStateData} from 'actions'
import UserForm from './User/MyInfoForm'

const FormItem = Form.Item;

class MyInfo extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    
  }
  render() {
    let {mainState} = this.props;

    return (
      <React.Fragment>
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">Thông tin cá nhân</h2>
            </Col>
            <Col span={12}>
              <div className="action-btns">
                {/* <Button 
                  //onClick={() => this.addNewRow()}
                  type="primary" icon="mail">Góp ý, phản hồi</Button> */}
              </div>
            </Col>
          </Row>
        </div>
        <UserForm mainState={this.props.mainState} dispatch={this.props.dispatch}/>
      </React.Fragment>
    );
  }
}

export default MyInfo