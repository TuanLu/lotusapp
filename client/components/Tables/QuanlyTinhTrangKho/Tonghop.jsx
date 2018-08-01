import React from 'react'
import { 
  Row, Col, Card
} from 'antd';

class Tonghop extends React.Component {
  getProductStatus() {
    let status = {
      waitingVerifyProducts: 0,
      refundProducts: 0,
      tempStock: 0
    };
    let {phieunhap} = this.props.mainState;
    let products = phieunhap.products ? phieunhap.products : [];
    let stocks = [];
    products.forEach((product) => {
      if(product.qc_check == "0" && product.qa_check != "1") {
        status.refundProducts += 1;
      }
      //Qc chua duyet
      if(!product.qc_check || product.qc_check == "2") {
        status.waitingVerifyProducts += 1;
      }
      //Qc duyet khong dat, nhung qa chua duyet
      if(product.qc_check == "0" && product.qa_check == "2") {
        status.waitingVerifyProducts += 1;
      }
    });
    return status;
  }
  render() {
    let {phieunhap} = this.props.mainState;
    let productStatus = this.getProductStatus();
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
              <Card title="Vật tư trong kho" bordered={false}>
                <div className="isd-status-number">{phieunhap.products && phieunhap.products.length ? phieunhap.products.length : 0}</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Vật tư chờ duyệt" bordered={false}>
                <div className="isd-status-number">{productStatus.waitingVerifyProducts}</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Vật tư chờ trả hàng" bordered={false}>
                <div className="isd-status-number">{productStatus.refundProducts}</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Vật tư chưa chuyển kho" bordered={false}>
                <div className="isd-status-number">0</div>
              </Card>
            </Col>
          </Row>
        </div>
      </React.Fragment>
    );
  }
}

export default Tonghop