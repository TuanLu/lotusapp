import React from 'react'
import { Form, Row, Col, Input, Button, 
  Icon, message, Select, DatePicker
} from 'antd';
const {RangePicker} = DatePicker;
import {getTokenHeader} from 'ISD_API'
import {updateStateData} from 'actions'
const FormItem = Form.Item;
const Option = Select.Option;
import {connect} from 'react-redux'

class AdvancedSearchForm extends React.Component {
  state = {
    loading: false
  };

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      let filters = {...values};
      if(filters['ngay_san_xuat'] && filters['ngay_san_xuat'].length) {
        let rangeValue = filters['ngay_san_xuat'];
        filters['ngay_san_xuat'] = [rangeValue[0].format('YYYY-MM-DD'), rangeValue[1].format('YYYY-MM-DD')];
       
      }
      if(filters['ngay_het_han'] && filters['ngay_het_han'].length) {
        let rangeValue = filters['ngay_het_han'];
        filters['ngay_het_han'] = [rangeValue[0].format('YYYY-MM-DD'), rangeValue[1].format('YYYY-MM-DD')];
       
      }
      //console.log('Received values of form: ', filters);
      this.search(filters);
    });
  }
  search(searchData) {
    this.setState({
      loading: true
    });
    this.props.loading(true);
    fetch(ISD_BASE_URL + 'khvt/search', {
      method: 'POST',
      headers: getTokenHeader(),
      body: JSON.stringify(searchData)
    })
    .then((response) => {
      return response.json()
    }).then((json) => {
      if(json.status == 'error') {
        message.error(json.message, 3);
      } else {
        //message.success(json.message);
        this.props.dispatch(updateStateData({
          phieunhap: {
            ...this.props.mainState.phieunhap,
            products: json.data
          }
        }));
      }
      this.setState({
        loading: false,
      });
      this.props.loading(false);
    }).catch((ex) => {
      console.log('parsing failed', ex)
      message.error('Có lỗi xảy ra trong quá trình tìm kiếm!');
      this.setState({
        loading: false,
      });
      this.props.loading(false);
    });
  }

  handleReset = () => {
    this.props.form.resetFields();
    this.search();
  }

  // To generate mock Form.Item
  getFields() {
    let {mainState} = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <React.Fragment>
        <Col span={8}>
          <FormItem label={`Lọc theo vật tư`}>
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
          <FormItem label={`Lọc theo mã kế hoạch`}>
            {getFieldDecorator(`ma`, {
              rules: [{
                required: false,
              }],
            })(
              <Input placeholder="Nhập mã kế hoạch sản xuất" />
            )}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={`Lọc theo mã quet`}>
            {getFieldDecorator(`ma_maquet`, {
              rules: [{
                required: false,
              }],
            })(
              <Input placeholder="Nhập mã quet" />
            )}
          </FormItem>
        </Col>
      </React.Fragment>
    );
  }
  componentDidMount() {
    
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
            <Button loading={this.state.loading} type="primary" htmlType="submit">Tìm kiếm</Button>
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
export default connect((state) => {
  return {
    mainState: state.main.present
  }
})(WrappedAdvancedSearchForm)