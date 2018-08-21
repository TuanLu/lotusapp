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

const formInfo = {
  person: 'Người giao hàng'
}

class FormThongtin extends React.Component {
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
    let {sx, phieuAction, ans_language} = this.props.mainState;
    let productListbyCate = this.state.productListbyCateList || [];
    if(!sx.hd) {
      sx.hd = 2;
    }
    let nsx = sx.nsx;
    nsx = moment(nsx);
      if(!nsx.isValid()) {
        nsx = null;// Might 	0000-00-00
    }
    // if(sx.so == ''){
    //   sx.so = '01.082018/LSX';
    // }
    let readOnly = phieuAction && phieuAction.action == 'view' ? true : false;
    //File upload
    let attachFile;
    if(sx.filename && sx.filename != "") {
      attachFile = sx.filename.split(',').map((file) => {
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
              label={ans_language.ans_number_lsx || 'ans_number_lsx' }
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
            <Input 
                readOnly={readOnly}
                onChange={(e) => {
                  this.props.dispatch(updateStateData({
                    sx: {
                      ...this.props.mainState.sx,
                      so: e.target.value
                    }
                  }));
                }}
                value={sx.so} />
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
                    sx: {
                      ...this.props.mainState.sx,
                      cong_doan: e.target.value
                    }
                  }));
                }}
                value={sx.cong_doan} />
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
                        sx: {
                          ...this.props.mainState.sx,
                          co_lo: e.target.value
                        }
                      }));
                    }}
                    value={sx.co_lo} />
                </FormItem>
            </Col>
            </Row>
            <Row>
            <Col span={12}>
            <FormItem
              label={ans_language.ans_so_dang_ky || 'ans_so_dang_ky'}
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
                      sx: {
                        ...this.props.mainState.sx,
                        dh: e.target.value
                      }
                    }));
                  }}
                  value={sx.dh} />
              </FormItem>
            </Col>
        </Row>
        <Row>
            <Col span={12}>
            <FormItem
              label={ans_language.ans_so_lo || 'ans_so_lo'}
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
              label={ans_language.ans_quy_cach_dong_goi || 'ans_quy_cach_dong_goi'}
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
                  sx: {
                    ...this.props.mainState.sx,
                    nsx: date
                  }
                }));
              }} placeholder="Chọn ngày"  format="DD/MM/YYYY"/>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label={ans_language.ans_expiry_date || 'ans_expiry_date'}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
              >
                <RadioGroup onChange={(e) => {
                    this.props.dispatch(updateStateData({
                      sx: {
                        ...this.props.mainState.sx,
                        hd: e.target.value
                      }}));
                    }
                  } 
                  disabled={readOnly}
                  name="hd" 
                  defaultValue={parseInt(sx.hd)}>
                  {/* <Radio value={1}>{ans_language.ans_expiry_date_6mon || 'ans_expiry_date_6mon'}</Radio> */}
                  <Radio value={1}>{ans_language.ans_expiry_date_1yr || 'ans_expiry_date_1yr'}</Radio>
                  <Radio value={2}>{ans_language.ans_expiry_date_2yr || 'ans_expiry_date_2yr'}</Radio>
                  <Radio value={3}>{ans_language.ans_expiry_date_3yr || 'ans_expiry_date_3yr'}</Radio>
                </RadioGroup>
              </FormItem>
            </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label={ans_language.ans_tttb_kltb || 'ans_tttb_kltb'}
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
                label={ans_language.ans_attach_file_label || 'File đính kèm'}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}>
                <UploadFile
                  fileList={attachFile ? attachFile : []}
                  onDone={(filename) => {
                    let files = this.props.mainState.sx.filename || '';
                    if(files != '') {
                      files += `,${filename}`;
                    } else {
                      files = filename;
                    }
                    this.props.dispatch(updateStateData({
                      sx: {
                        ...this.props.mainState.sx,
                        filename: files
                      }
                    }));
                  }}
                  onRemove={(filename) => {
                    let files = this.props.mainState.sx.filename || '';
                    if(files != '') {
                      files = files.split(',').filter((file) => file != filename);
                      files = files.join(',');
                    }
                    this.props.dispatch(updateStateData({
                      sx: {
                        ...this.props.mainState.sx,
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