import React from 'react'
import moment from 'moment'
import { 
  Table, Input, InputNumber, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message, Alert,
  Menu, Dropdown, Icon, DatePicker
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject} from 'ISD_API'
import {updateStateData} from 'actions'

const FormItem = Form.Item;

const tableConfig = {
  headTitle: 'Vật tư của phiếu xuất',
  addNewTitle: 'Thêm vật tư vào phiếu xuất'
};

const fetchConfig = {
  fetch: 'phieuxuat/fetch',
  update: 'phieuxuat/updateProduct',
  delete: 'phieuxuat/deleteProduct/',
}

class ExportProduct extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      productList: {},
      selectedRowKeys: [], 
      loading: false,
      loadProduct: false
    };
    this.updateQty = this.updateQty.bind(this);
    this.columns = [
      // {
      //   title: 'Mã Lô',
      //   dataIndex: 'ma_lo',
      //   width: 100,
      //   //fixed: 'left',
      //   editable: false,
      //   required: true,
      // },
      {
        title: 'Mã VT',
        dataIndex: 'product_id',
        //fixed: 'left',
        width: 150,
      },
      // {
      //   title: 'Quy cách',
      //   dataIndex: 'label',
      //   width: 200,
      // },
      // {
      //   title: 'Đơn vị tính',
      //   dataIndex: 'unit',
      //   width: 100,
      // },
      // {
      //   title: 'SL theo chứng từ',
      //   dataIndex: 'sl_chungtu',
      //   render: (text, record) => {
      //     return (
      //       <InputNumber value={text} onChange={(value) => {
      //         this.updateQty(record, 'sl_chungtu', value);
      //       }}/>
      //     )
      //   }
      // },
      {
        title: 'Số lượng thực xuất',
        dataIndex: 'sl_thucnhap',
        render: (text, record) => {
          return (
            <InputNumber value={text} onChange={(value) => {
              this.updateQty(record, 'sl_thucnhap', value);
            }}/>
          )
        }
      },
      {
        title: 'Ngày SX',
        dataIndex: 'ngay_san_xuat',
        width: '200px',
        //width: '40%',
        editable: false,
        required: true,
        render: (text, record) => moment(text).format('DD/MM/YYYY')
      },
      {
        title: 'Ngày Hết Hạn',
        dataIndex: 'ngay_het_han',
        width: '200px',
        //width: '40%',
        editable: false,
        required: true,
        render: (text, record) => moment(text).format('DD/MM/YYYY')
      },
      {
        title: 'Action',
        dataIndex: 'delete',
        render: (text, record) => {
          let isReadOnly = this.isReadOnly();
          if(isReadOnly) return '';
          return (
            <Popconfirm
              title="Bạn thật sự muốn xoá?"
              onConfirm={() => this.delete(record)}>
                <Button type="danger">Delete</Button>
            </Popconfirm>
            
          );
        }
      },
    ];
  }
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }
  updateQty(record, field, value) {
    let itemId = record.id;
    let {phieuxuat} = this.props.mainState;
    if(itemId && phieuxuat.products && phieuxuat.products.length) {
      let newProducts = phieuxuat.products.map((product) => {
        if(product.id == itemId) {
          product[field] = value;
        }
        return product;
      });
      this.props.dispatch(updateStateData({
        phieuxuat: {
          ...this.props.mainState.phieuxuat,
          products: newProducts
        }
      }))
    }
  }
  openProductModal() {
    this.props.dispatch(updateStateData({
      phieuXuatAction: {
        ...this.props.mainState.phieuXuatAction,
        openModal: true
      }
    }))
  }
  isReadOnly() {
    let {phieuXuatAction} = this.props.mainState;
    return phieuXuatAction && phieuXuatAction.action == 'view' ? true : false;
  }
  edit(key) {
    this.props.dispatch(updateStateData({
      phieuXuatAction: {
        ...this.props.mainState.phieuXuatAction,
        editingKey: key
      }
    }));
  }
  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.props.mainState.phieuxuat.products];
      let maPhieu = this.props.mainState.phieuxuat.ma_phieu || '';
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        //console.log(item, row);//update to server here
        let newItemData = {
          ...item,
          ...row,
          ma_phieu: maPhieu,
          ngay_san_xuat: row['ngay_san_xuat'].format('YYYY-MM-DD'),
          ngay_het_han: row['ngay_het_han'].format('YYYY-MM-DD'),
        };
        //Chua co ma phieu va ID la trong
        if(!newData.id && !maPhieu) {
          newData.splice(index, 1, {
            ...newItemData
          });
          this.props.dispatch(updateStateData({
            phieuxuat: {
              ...this.props.mainState.phieuxuat,
              products: newData
            },
            phieuXuatAction: {
              ...this.props.mainState.phieuXuatAction,
              editingKey: '',
            }
          }));
          return false;
        } else {
          if(maPhieu) {
            fetch(ISD_BASE_URL + fetchConfig.update, {
              method: 'POST',
              headers: getTokenHeader(),
              body: JSON.stringify(newItemData)
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
                newData.splice(index, 1, {
                  ...newItemData,
                  ...json.data
                });
                this.props.dispatch(updateStateData({
                  phieuxuat: {
                    ...this.props.mainState.phieuxuat,
                    products: newData
                  },
                  phieuXuatAction: {
                    ...this.props.mainState.phieuXuatAction,
                    editingKey: '',
                  }
                }));
                message.success(json.message);
              }
            }).catch((ex) => {
              console.log('parsing failed', ex)
              message.error('Có lỗi xảy ra trong quá trình lưu hoặc chỉnh sửa!');
            });
          }
        }
        
      } else {
        newData.push(data);
        this.setState({ data: newData, editingKey: '' });
      }
    });
  }
  cancel = (key) => {
    this.props.dispatch(updateStateData({
      phieuXuatAction: {
        ...this.props.mainState.phieuXuatAction,
        editingKey: ''
      }
    }));
  }
  delete = (record) => {
    let newData = this.props.mainState.phieuxuat.products.filter((item) => item.product_id != record.product_id);
    this.props.dispatch(updateStateData({
      phieuxuat: {
        ...this.props.mainState.phieuxuat,
        products: newData
      }
    }));
  }
  fetchSelectedProduct() {
    let {phieuxuat} = this.props.mainState;
    let maPhieu = phieuxuat.ma_phieu;
    this.setState({loadProduct: true});
    fetch(ISD_BASE_URL + `phieuxuat/fetchSelectedProduct/${maPhieu}`, {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            phieuxuat: {
              ...this.props.mainState.phieuxuat,
              products: json.data
            }
          }));          
        }
      } else {
        this.props.dispatch(updateStateData({
          phieuxuat: {
            ...this.props.mainState.phieuxuat,
            products: []
          }
        }));
        message.error(json.message);
      }
      this.setState({loadProduct: false});
    })
    .catch((error) => {
      console.log(error);
    });
  }
  componentDidMount() {
    let {phieuxuat} = this.props.mainState;
    if(phieuxuat.ma_phieu) {
      this.fetchSelectedProduct();
    }
  }
  render() {
    let columns = this.columns;
    let selectedProducts = this.props.mainState.phieuxuat.products || [];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <React.Fragment>
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">{tableConfig.headTitle}</h2>
            </Col>
            <Col span={12}>
              <div className="action-btns">
                {!this.isReadOnly() ? 
                  <Button 
                  onClick={() => this.openProductModal()}
                  type="primary" icon="plus">{tableConfig.addNewTitle}</Button> : null}
              </div>
            </Col>
          </Row>
        </div>
        <Table
          bordered
          dataSource={selectedProducts}
          columns={columns}
          rowClassName="editable-row"
          loading={this.state.loadProduct}
          //scroll={{ x: 1500 }}
        />
      </React.Fragment>
    );
  }
}

export default ExportProduct