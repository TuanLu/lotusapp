import React from 'react'
import moment from 'moment';
import { Form, Select, Input, Row, Col, DatePicker, Radio, Button,Popconfirm,message } from 'antd';
import {updateStateData} from 'actions'
import {getTokenHeader, trangThaiPhieu} from 'ISD_API'
const FormItem = Form.Item;
const Option = Select.Option;
const dateFormat = 'YYYY/MM/DD';
const RadioGroup = Radio.Group;

class FormThongtin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      productListbyCateList: []
    }
  }
  fetchData() {
    fetch(ISD_BASE_URL + 'rnd/fetchKho', {
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
          this.props.dispatch(updateStateData({kho: json.data}));
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu dữ liệu kho!', 3);
      console.log(error);
    }); 
  }
  //Get product list by cate_id
  fetchProductbyCate() {
    let cateId = 19;
    fetch(ISD_BASE_URL + `rnd/fetchProductByCate/${cateId}`, {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            productListbyCate: json.data
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
    this.fetchProductbyCate();
  }
  render() {
    let {rnd, phieuAction, ans_language} = this.props.mainState;
    let productListbyCate = this.state.productListbyCateList || [];
    if(!rnd.hd) {
      rnd.hd = 2;
    }
    let nsx = rnd.nsx;
    nsx = moment(nsx);
      if(!nsx.isValid()) {
        nsx = null;// Might 	0000-00-00
    }
    let readOnly = phieuAction && phieuAction.action == 'view' ? true : false;
    return (
      <Form>
        <Row>
            <Col span={12}>
            <FormItem
              label={ans_language.ans_number_rnd || 'ans_number_rnd' }
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    rnd: {
                      ...this.props.mainState.rnd,
                      ma_nc: e.target.value
                    }
                  }));
                }}
                value={rnd.ma_nc} />
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem
              label={ans_language.ans_cong_doan || 'ans_cong_doan'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    rnd: {
                      ...this.props.mainState.rnd,
                      cong_doan: e.target.value
                    }
                  }));
                }}
                value={rnd.cong_doan} />
            </FormItem>
            </Col>
        </Row>
        <Row>
            <Col span={12}>
              <FormItem
                label={ans_language.ans_product || 'ans_product'}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
              >
                <Select 
                  defaultValue={rnd.ma_sp}
                  showSearch
                  optionFilterProp="children"
                  onChange={(value, option) => {
                    this.props.dispatch(updateStateData({
                      rnd: {
                        ...this.props.mainState.rnd,
                        ma_sp: value
                      }
                    }));
                  }}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  //style={{ width: 200 }}
                  placeholder={ans_language.ans_choose_product || 'ans_choose_product'}>
                  {productListbyCate.map((product) => {
                    return <Select.Option 
                    key={product.product_id} 
                    value={product.product_id}> 
                      {`${product.product_id} - ${product.name} - ${product.unit} `}
                  </Select.Option>
                })}
                </Select>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                  label={ans_language.ans_co_lo || 'ans_co_lo'}
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 12 }}
                >
                <Input 
                    readOnly={readOnly}
                    onChange={(e) => {
                      this.props.dispatch(updateStateData({
                        rnd: {
                          ...this.props.mainState.rnd,
                          co_lo: e.target.value
                        }
                      }));
                    }}
                    value={rnd.co_lo} />
                </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label={ans_language.ans_order || 'ans_order'}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
              >
              <Input 
                  readOnly={readOnly}
                  onChange={(e) => {
                    this.props.dispatch(updateStateData({
                      rnd: {
                        ...this.props.mainState.rnd,
                        dh: e.target.value
                      }
                    }));
                  }}
                  value={rnd.dh} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label={ans_language.ans_quy_cach_dong_goi || 'ans_quy_cach_dong_goi'}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
              >
              <Input 
                  readOnly={readOnly}
                  onChange={(e) => {
                    this.props.dispatch(updateStateData({
                      rnd: {
                        ...this.props.mainState.rnd,
                        qcdg: e.target.value
                      }
                    }));
                  }}
                  value={rnd.qcdg} />
              </FormItem>
            </Col>
        </Row>
        <Row>
            <Col span={12}>
              <FormItem
                label={ans_language.ans_date_of_manufacture || 'ans_date_of_manufacture'}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
              >
              <DatePicker defaultValue={nsx} onChange={(date) => {
                if(date != null){
                  date = date.format('YYYY-MM-DD');
                }else{ 
                  date = '';
                }
                this.props.dispatch(updateStateData({
                  rnd: {
                    ...this.props.mainState.rnd,
                    nrnd: date
                  }
                }));
              }} placeholder="Chọn ngày"  format="DD/MM/YYYY"/>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label={ans_language.ans_dang_bao_che || 'ans_dang_bao_che'}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
              >
              <Input 
                  readOnly={readOnly}
                  onChange={(e) => {
                    this.props.dispatch(updateStateData({
                      rnd: {
                        ...this.props.mainState.rnd,
                        dang_bao_che: e.target.value
                      }
                    }));
                  }}
                  value={rnd.dang_bao_che} />
              </FormItem>
              </Col>
            </Row>
      </Form>
    );
  }
}

export default FormThongtin;