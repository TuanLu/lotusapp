import React, { Component } from 'react';
import {Row, Col} from 'antd'
import Gantt from './QuanlyQuytrinhSanxuat/Gantt'

class KehoachSanxuatDaihan extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let {mainState, dispatch} = this.props;
    return (
     <div className="wrap-gantt-chart khdh">
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">Kế hoạch sản xuất dài hạn</h2>
            </Col>
            <Col span={12}>
              
            </Col>
          </Row>
        </div>
       <Gantt mainState={mainState} dispatch={dispatch} type="allPlan" />
     </div>
    );
  }
}

export default KehoachSanxuatDaihan