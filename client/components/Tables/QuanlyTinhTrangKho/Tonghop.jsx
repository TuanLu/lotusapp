import React from 'react'
import { 
  Row, Col, Card
} from 'antd';

class Tonghop extends React.Component {
  render() {
    return(
      <React.Fragment>
        <div className="table-operations no-margin">
          <Row>
            <Col span={12}>
              <h2 className="head-title">Thông tin tổng hợp</h2>
            </Col>
            <Col span={12}>
              
            </Col>
          </Row>
        </div>
        <div style={{
          background: '#ECECEC', 
          padding: '10px',
          marginBottom: 10
        }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card title="Tổng sản phẩm trong kho" bordered={false}>
                <div className="isd-status-number">1000</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Sản phẩm chờ duyệt" bordered={false}>
                <div className="isd-status-number">200</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Sản phẩm chờ trả hàng" bordered={false}>
                <div className="isd-status-number">170</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Sản phẩm chưa chuyển kho" bordered={false}>
                <div className="isd-status-number">90</div>
              </Card>
            </Col>
          </Row>
        </div>
      </React.Fragment>
    );
  }
}

export default Tonghop