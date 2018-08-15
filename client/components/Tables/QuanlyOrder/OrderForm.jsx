import React from 'react'
import moment from 'moment'
import {updateStateData} from 'actions'
import { Form, Input, Tooltip, Icon, DatePicker, Select, Row, Col, Checkbox, Button, Upload, message } from 'antd';
import {getTokenHeader} from 'ISD_API'
const { MonthPicker } = DatePicker;

const FormItem = Form.Item;
const Option = Select.Option;

class OrderForm extends React.Component {
  state = {
    confirmDirty: false,
    groupUser: [],
    productListbyCateList: []
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        //Get USER ID from mainstate
        let {systemOrder} = this.props.mainState;
        values.id = systemOrder.id ? systemOrder.id : '';
        fetch(ISD_BASE_URL + 'order/updateDh', {
          method: 'POST',
          headers: getTokenHeader(),
          body: JSON.stringify(values)
        })
        .then((response) => {
          return response.json()
        }).then((json) => {
          if(json.status == 'error') {
            message.error(json.message, 3);
            if(json.show_login) {
              this.props.dispatch(updateStateData({showLogin: true}));
            }
          } else {
            //udate table state
            message.success(json.message);
            this.props.dispatch(updateStateData({ 
              systemOrder: {
                //...record, 
                refresh: true,
                openModal: false
              }
            }));
          }
        }).catch((ex) => {
          console.log('parsing failed', ex)
          message.error('Có lỗi xảy ra trong quá trình thêm ghi chú!');
        });
      }
    });
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }
  fetchProductListbyCate(cateId){
    fetch(ISD_BASE_URL + `rnd/fetchProductByCate/${cateId}`, {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            productListbyCateList: json.data
          }));
          this.setState({
            productListbyCateList: json.data
          });
        }
      } else {
        message.error(json.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }
  componentDidMount() {
    let productListbyCateList = this.state.productListbyCateList || [];
    if(productListbyCateList.length == 0){
      this.fetchProductListbyCate(19);
    }
  }
  normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
  render() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        // xs: { span: 24 },
        // sm: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
    };
    const form50Layout = {
      labelCol: {
        // xs: { span: 24 },
        // sm: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 20 },
        sm: { span: 20 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };

    let {systemOrder, ans_language, customers} = this.props.mainState;
    let productListbyCateList = this.state.productListbyCateList; 
    let customerOptions = [];
    let date_delive = moment(systemOrder.date_delive);
    if(!date_delive.isValid()) {
      date_delive = null;// Might 	0000-00-00
    } 
    if(customers && customers.length) {
      customerOptions = customers.map((user) => {
        return <Option value={user.ma_kh} key={user.ma_kh}>{user.ma_kh} - {user.name}</Option>
      });
    }
    let productOptions = [];
    if(productListbyCateList && productListbyCateList.length) {
      productOptions = productListbyCateList.map((product) => {
        return <Option value={product.product_id} key={product.product_id}>{product.product_id} - {product.name}</Option>
      });
    }
    return (
      <Form onSubmit={this.handleSubmit}>
        <Row className="ans_row_margin_10">
          <Col span="12">
              <FormItem
                {...formItemLayout}
                label={(
                  <span>
                    {ans_language.ans_order_titles || 'ans_order_titles'} &nbsp;
                    <Tooltip title={ans_language.ans_order_titles_note || 'ans_order_titles_note' }>
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                )}
              >
              {getFieldDecorator('ma_order', {
                initialValue: systemOrder.ma_order,
                rules: [{ required: true, message: ans_language.ans_pls_enter_title || 'ans_pls_enter_title' , whitespace: true }],
              })(
                <Input className="ans_input_80" />
              )}
            </FormItem>
            </Col>
            <Col span="12">
              <FormItem
                {...formItemLayout}
                label={(
                  <span>
                    {ans_language.ans_customer_titles || 'ans_customer_titles'} &nbsp;
                    <Tooltip title={ans_language.ans_customer_titles_note || 'ans_customer_titles_note' }>
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                )}
                >
                {getFieldDecorator('ma_kh', {
                  initialValue: systemOrder.ma_kh,
                  rules: [{ required: true, message: ans_language.ans_pls_enter_title || 'ans_pls_enter_title' , whitespace: true }],
                })(
                  <Select 
                    placeholder="Chọn khách hàng"
                    mode=""
                    onChange={(value) => {
                      console.log(value);
                    }}
                  >
                  {customerOptions}
                  </Select>
                )}
              </FormItem>
            </Col>
        </Row>
        <Row className="ans_row_margin_10">
          <Col span={12}>
            <FormItem
              {...form50Layout}
              label={ans_language.ans_product_name || 'ans_product_name'}
            > 
            {getFieldDecorator('product_id', {
              initialValue: systemOrder.product_id,
              rules: [{ required: false, message: ans_language.ans_choose_product || 'ans_choose_product' }],
            })(
              <Select 
                placeholder="Chọn sản phẩm"
                mode=""
                onChange={(value) => {
                  console.log(value);
                }}
              >
              {productOptions}
              </Select>
            )}
          </FormItem>
          </Col>
          <Col span="12">
            <FormItem
              {...formItemLayout}
              label={(
                <span>
                  {ans_language.ans_qty_titles || 'ans_qty_titles'} &nbsp;
                  <Tooltip title={ans_language.ans_qty_titles_note || 'ans_qty_titles_note' }>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              )}
            >
            {getFieldDecorator('qty', {
              initialValue: systemOrder.qty,
              rules: [{ required: true, message: ans_language.ans_pls_enter_title || 'ans_pls_enter_title' , whitespace: true }],
            })(
              <Input />
            )}
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
              <FormItem
                {...formItemLayout}
                  label={(
                    <span>
                      {ans_language.ans_date_delive || 'ans_date_delive'} &nbsp;
                      <Tooltip title={ans_language.ans_date_delive_note || 'ans_date_delive_note' }>
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )}
                >
                <DatePicker defaultValue={date_delive} onChange={(date) => {
                  if(date != null){
                    date = date.format('YYYY-MM-DD');
                  }else{ 
                    date = '';
                  }
                  this.props.dispatch(updateStateData({
                    systemOrder: {
                      ...this.props.mainState.systemOrder,
                      date_delive: date
                    }
                  }));
                }}  placeholder="Chọn ngày" format="DD-MM-YYYY"/>
              </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formItemLayout}
              label="Nội dung ghi chú cho đơn hàng"
              >
                {getFieldDecorator('note', {
                  initialValue: systemOrder.note
                })(
                  <Input.TextArea style={{ width: '100%', minHeight: '200px' }} />
                )}
              </FormItem>
          </Col>
          <Col span={24}>
            <FormItem
            {...formItemLayout}
            label="Upload"
            extra=""
            >
            {getFieldDecorator('upload', {
              valuePropName: 'fileList',
              getValueFromEvent: this.normFile,
            })( // Need function upload
              <Upload name="logo" action="/upload" listType="picture">
                <Button>
                  <Icon type="upload" /> {ans_language.ans_attach_file || 'ans_attach_file' }
                </Button>
              </Upload>
            )}
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
              <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">{ans_language.ans_send || 'ans_send'}</Button>
              </FormItem>
          </Col>
        </Row>
        </Form>
    );
  }  
}

const WrappedNoteForm = Form.create()(OrderForm);

export default WrappedNoteForm;