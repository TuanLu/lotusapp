import React from 'react'
import moment from 'moment';
import { Form, Select, Input, Row, Col, DatePicker, Radio, Button,Popconfirm,message } from 'antd';
import {updateStateData} from 'actions'
import {getTokenHeader, trangThaiPhieu} from 'ISD_API'
import UploadFile from './../../UploadFile'
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
  fetchDonhang() {
    fetch(ISD_BASE_URL + `order/fetchDh`, {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            orderList: json.data
          }));
          this.setState({
            orderList: json.data
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
    this.fetchDonhang();
  }
  render() {
    let {rnd, phieuAction, ans_language} = this.props.mainState;
    let productListbyCate = this.state.productListbyCateList || [];
    let orderList = this.state.orderList || [];
    if(!rnd.hd) {
      rnd.hd = 2;
    }
    let nsx = rnd.nsx;
    nsx = moment(nsx);
      if(!nsx.isValid()) {
        nsx = null;// Might 	0000-00-00
    }
    let readOnly = phieuAction && phieuAction.action == 'view' ? true : false;
    //File upload
    let attachFile;
    if(rnd.filename && rnd.filename != "") {
      attachFile = rnd.filename.split(',').map((file) => {
        return {
          uid: file,
          name: file,
          status: 'done',
          url: ISD_BASE_URL + 'upload/' + file,
        }
      });
    }
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
              {/* <FormItem
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
                </FormItem> */}
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
            <Col span={12}>
              <FormItem
                label={ans_language.ans_order || 'ans_order'}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
              >
                <Select 
                  defaultValue={rnd.dh}
                  showSearch
                  optionFilterProp="children"
                  onChange={(value, option) => {
                    this.props.dispatch(updateStateData({
                      rnd: {
                        ...this.props.mainState.rnd,
                        dh: value
                      }
                    }));
                  }}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  //style={{ width: 200 }}
                  placeholder={ans_language.ans_choose_order || 'ans_choose_order'}>
                  {orderList.map((order) => {
                    return <Select.Option 
                    key={order.ma_order} 
                    value={order.ma_order}> 
                      {`${order.ma_order} - ${order.ma_kh} - ${order.qty} `}
                  </Select.Option>
                })}
                </Select>
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
                    nsx: date
                  }
                }));
              }} placeholder="Chọn ngày"  format="DD/MM/YYYY"/>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label={ans_language.ans_attach_file_label || 'File đính kèm'}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}>
                <UploadFile
                  fileList={attachFile ? attachFile : []}
                  onDone={(filename) => {
                    let files = this.props.mainState.rnd.filename || '';
                    if(files != '') {
                      files += `,${filename}`;
                    } else {
                      files = filename;
                    }
                    this.props.dispatch(updateStateData({
                      rnd: {
                        ...this.props.mainState.rnd,
                        filename: files
                      }
                    }));
                  }}
                  onRemove={(filename) => {
                    let files = this.props.mainState.rnd.filename || '';
                    if(files != '') {
                      files = files.split(',').filter((file) => file != filename);
                      files = files.join(',');
                    }
                    this.props.dispatch(updateStateData({
                      rnd: {
                        ...this.props.mainState.rnd,
                        filename: files
                      }
                    }));
                  }}
                  mainState={this.props.mainState}
                  dispatch={this.props.dispatch}/>
              </FormItem>
              </Col>
            </Row>
      </Form>
    );
  }
}

export default FormThongtin;