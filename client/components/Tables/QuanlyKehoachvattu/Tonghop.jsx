import React from 'react'
import { 
  Row, Col, Card
} from 'antd';

class Tonghop extends React.Component {
  getProductStatus() {
    let status = {
      inStock: 0,
      outStock: 0,
      stock: 0
    };
    let {kehoachvt} = this.props.mainState;
    let products = kehoachvt.products ? kehoachvt.products : [];
    let stocks = [];
    products.forEach((product) => {
      if(product.ma_kho) {
        if(stocks.indexOf(product.ma_kho) == -1) {
          stocks.push(product.ma_kho);
        }
      }
      if(parseFloat(product.sl_thucnhap) >= parseFloat(product.sl_nvl)) {
        status.inStock += 1;
      } else {
        status.outStock += 1;
      }
    });
    status.stock = stocks.length;
    return status;
  }
  render() {
    let {kehoachvt} = this.props.mainState;
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
              <Card title="Tổng vật tư cần" bordered={false}>
                <div className="isd-status-number">{kehoachvt.products && kehoachvt.products.length ? kehoachvt.products.length : 0}</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Vật tư khả dụng" bordered={false}>
                <div className="isd-status-number">{productStatus.inStock}</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Vật tư thiếu" bordered={false}>
                <div className="isd-status-number">{productStatus.outStock}</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Số kho liên quan" bordered={false}>
                <div className="isd-status-number">{productStatus.stock}</div>
              </Card>
            </Col>
          </Row>
        </div>
      </React.Fragment>
    );
  }
}

export default Tonghop