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
  fetchProductInInventory() {
    fetch(ISD_BASE_URL + 'tinhtrangkho/fetchProductInInventory', {
      headers: getTokenHeader()
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.status == 'error') {
        message.warning(json.message, 3);
      } else {
        if(json.data) {
          this.props.dispatch(updateStateData({
            productInInventory: json.data
          }));
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu dữ liệu kho!', 3);
      console.log(error);
    });
  }
  fetchKho() {
    fetch(ISD_BASE_URL + 'qlkho/fetchKho', {
      headers: getTokenHeader()
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.status == 'error') {
        message.warning(json.message, 3);
      } else {
        if(json.data) {
          this.props.dispatch(updateStateData({
            kho: json.data
          }));
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu dữ liệu kho!', 3);
      console.log(error);
    }); 
  }
  fetchCate() {
    fetch(ISD_BASE_URL + 'qlcate/fetchCate', {
      headers: getTokenHeader()
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.status == 'error') {
        message.warning(json.message, 3);
      } else {
        if(json.data) {
          this.props.dispatch(updateStateData({
            categories: json.data
          }));
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu dữ liệu kho!', 3);
      console.log(error);
    }); 
  }
  search(searchData) {
    this.setState({
      loading: true
    });
    this.props.loading(true);
    fetch(ISD_BASE_URL + 'tinhtrangkho/search', {
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
    let ans_lang = mainState.ans_language;
    let kho = mainState.kho || [];
    let cates = mainState.categories || [];
    let productInInventory = mainState.productInInventory || [];
    const { getFieldDecorator } = this.props.form;
    return (
      <React.Fragment>
        <Col span={8}>
          <FormItem label={ans_lang.ans_filterby_cateid || 'ans_filterby_cateid'}>
            {getFieldDecorator(`ma_kho`, {
              rules: [{
                required: false,
              }],
            })(
              <Select 
                showSearch
                mode="multiple"
                placeholder={ans_lang.ans_pls_enter_cate_id || 'ans_pls_enter_cate_id'}>
                {kho.map((kho) =><Option value={kho.ma_kho} key={kho.ma_kho}>{kho.name}</Option>)}
              </Select>
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
              <Select 
                showSearch
                mode="multiple"
                placeholder="Nhập mã vật tư">
                {productInInventory.map((vattu) =><Option value={vattu.product_id} key={vattu.product_id}>{vattu.product_id} {"-"} {vattu.name}</Option>)}
              </Select>
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
              <RangePicker 
                placeholder={['Từ Ngày', 'Đến Ngày']}
                format="DD/MM/YYYY" />
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
              <RangePicker 
                placeholder={['Từ Ngày', 'Đến Ngày']}
                format="DD/MM/YYYY" />
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
        <Col span={8}>
          <FormItem label={`Lọc theo Danh mục vật tư`}>
            {getFieldDecorator(`ma_cate`, {
              rules: [{
                required: false,
              }],
            })(
              <Select 
                showSearch
                mode="multiple"
                placeholder="Nhập mã danh mục">
                {cates.map((cate) =><Option value={cate.id} key={cate.id}>{cate.ma_cate ? cate.ma_cate +' -' : "" } {cate.name}</Option>)}
              </Select>
            )}
          </FormItem>
        </Col>
      </React.Fragment>
    );
  }
  componentDidMount() {
    let {mainState} = this.props;
    let kho = mainState.kho || [];
    let cates = mainState.categories || [];
    let productInInventory = mainState.productInInventory || [];
    if(!kho.length) {
      this.fetchKho();
    }
    if(!cates.length) {
      this.fetchCate();
    }
    if(!productInInventory.length) {
      this.fetchProductInInventory();
    }
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