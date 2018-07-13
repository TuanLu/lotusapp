import React from 'react'
import moment from 'moment';
import { Form, Select, Input, Row, Col, DatePicker, Button,Popconfirm,message } from 'antd';
import {updateStateData} from 'actions'
import {getTokenHeader, trangThaiPhieu} from 'ISD_API'
const FormItem = Form.Item;
const Option = Select.Option;
const dateFormat = 'YYYY/MM/DD';

const formInfo = {
  person: 'Người giao hàng'
}

class FormNote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      productListbyCateList: []
    }
  }
  fetchData() {
    fetch(ISD_BASE_URL + 'sx/fetchKho', {
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
    fetch(ISD_BASE_URL + `sx/fetchProductByCate/${cateId}`, {
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
    let {sx, phieuAction} = this.props.mainState;
    let hsd = sx.hd;
    hsd = moment(hsd);
    let productListbyCate = this.state.productListbyCateList || [];
    if(!hsd.isValid()) {
      hsd = null;// Might 	0000-00-00
    }
    let nsx = sx.nsx;
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
              label={'MÃ'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      ma: e.target.value
                    }
                  }));
                }}
                value={sx.ma} />
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem
              label={'SẢN PHẨM'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Select 
              defaultValue={sx.ma_sp}
              showSearch
              optionFilterProp="children"
              onChange={(value, option) => {
                this.props.dispatch(updateStateData({
                  sx: {
                    ...this.props.mainState.sx,
                    ma_sp: value
                  }
                }));
              }}
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              //style={{ width: 200 }}
              placeholder="Chọn VT">
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
            </Row>
            <Row>
            <Col span={12}>
              <FormItem
                label={'CỠ LÔ'}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
              >
              <Input 
                  readOnly={readOnly}
                  onChange={(e) => {
                    this.props.dispatch(updateStateData({
                      sx: {
                        ...this.props.mainState.sx,
                        co_lo: e.target.value
                      }
                    }));
                  }}
                  value={sx.co_lo} />
              </FormItem>
            </Col>
            <Col span={12}>
            <FormItem
              label={'SĐK'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      so_dk: e.target.value
                    }
                  }));
                }}
                value={sx.so_dk} />
            </FormItem>
            </Col>
        </Row>
        <Row>
            <Col span={12}>
            <FormItem
              label={'SỐ LÔ'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      so_lo: e.target.value
                    }
                  }));
                }}
                value={sx.so_lo} />
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem
              label={'QCĐG'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      qcdg: e.target.value
                    }
                  }));
                }}
                value={sx.qcdg} />
            </FormItem>
            </Col>
        </Row>
        <Row>
            <Col span={12}>
            <FormItem
              label={'HSD'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <DatePicker defaultValue={hsd} onChange={(date) => {
              if(date != null){
                date = date.format('YYYY-MM-DD');
              }else{ 
                date = '';
              }
              this.props.dispatch(updateStateData({
                sx: {
                  ...this.props.mainState.sx,
                  hd: date
                }
              }));
            }} placeholder="Chọn ngày" format="DD/MM/YYYY"/>
            
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem
              label={'NSX'}
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
                sx: {
                  ...this.props.mainState.sx,
                  nsx: date
                }
              }));
            }} placeholder="Chọn ngày"  format="DD/MM/YYYY"/>
            </FormItem>
            </Col>
            </Row>
            <Row>
            <Col span={12}>
            <FormItem
              label={'ĐH'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      dh: e.target.value
                    }
                  }));
                }}
                value={sx.dh} />
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem
              label={'DẠNG BÀO CHẾ'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      dang_bao_che: e.target.value
                    }
                  }));
                }}
                value={sx.dang_bao_che} />
            </FormItem>
            </Col>
            </Row>
            <Row>
            <Col span={12}>
            <FormItem
              label={'TTTB/KLTB'}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      tttb_kltb: e.target.value
                    }
                  }));
                }}
                value={sx.tttb_kltb} />
            </FormItem>
            </Col>
        </Row>
      </Form>
    );
  }
}

export default FormNote;