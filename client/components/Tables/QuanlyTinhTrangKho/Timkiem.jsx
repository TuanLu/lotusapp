import React from 'react'
import { Form, Row, Col, Input, Button, Icon } from 'antd';
const FormItem = Form.Item;

class AdvancedSearchForm extends React.Component {
  state = {
    expand: false,
  };

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
    });
  }

  handleReset = () => {
    this.props.form.resetFields();
  }

  // To generate mock Form.Item
  getFields() {
    const count = this.state.expand ? 10 : 6;
    const { getFieldDecorator } = this.props.form;
    return (
      <React.Fragment>
        <Col span={8}>
          <FormItem label={`Lọc theo mã kho`}>
            {getFieldDecorator(`ma_kho`, {
              rules: [{
                required: false,
              }],
            })(
              <Input placeholder="Nhập mã kho" />
            )}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={`Lọc theo mã vật tư`}>
            {getFieldDecorator(`product_id`, {
              rules: [{
                required: false,
              }],
            })(
              <Input placeholder="Nhập mã vật tư" />
            )}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={`Lọc theo mã lô`}>
            {getFieldDecorator(`ma_lo`, {
              rules: [{
                required: false,
              }],
            })(
              <Input placeholder="Nhập mã lô" />
            )}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={`Lọc theo ngày sản xuất`}>
            {getFieldDecorator(`ngay_san_xuat`, {
              rules: [{
                required: false,
              }],
            })(
              <Input placeholder="Nhập ngày sản xuất" />
            )}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={`Lọc theo ngày hết hạn`}>
            {getFieldDecorator(`ngay_het_han`, {
              rules: [{
                required: false,
              }],
            })(
              <Input placeholder="Nhập ngày hết hạn" />
            )}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={`Lọc sản phẩm sắp hết hạn`}>
            {getFieldDecorator(`sap_het_han`, {
              rules: [{
                required: false,
              }],
            })(
              <Input placeholder="Nhập số ngày" />
            )}
          </FormItem>
        </Col>
      </React.Fragment>
    );
  }

  render() {
    return (
      <Form
        className="isd-advanced-search-form"
        onSubmit={this.handleSearch}
      >
        <Row gutter={24}>{this.getFields()}</Row>
        <Row>
          <Col span={24} style={{ textAlign: 'center', marginTop: 10 }}>
            <Button type="primary" htmlType="submit">Tìm kiếm</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
              Reset bộ lọc
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);
export default WrappedAdvancedSearchForm