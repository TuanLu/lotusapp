import React from 'react'
import moment from 'moment'
import { 
  Table, Input, InputNumber, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message, Alert,
  Menu, Dropdown, Icon, DatePicker, Switch
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject, qcQAStatus} from 'ISD_API'
import {updateStateData} from 'actions'

const checkStatusOptions = convertArrayObjectToObject(qcQAStatus);

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const tableConfig = {
  headTitle: 'Vật tư',
  addNewTitle: 'Thêm vật tư'
};

const fetchConfig = {
  fetch: 'phieunhap/fetch',
  update: 'phieunhap/updateProduct',
  delete: 'phieunhap/deleteProduct/',
  changeStatus: 'phieunhap/changeStatus'
}

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  getInput = () => {
    switch (this.props.inputType) {
      case 'product_id':
        let products = this.props.products;
        return (
          <Select 
            showSearch
            optionFilterProp="children"
            onChange={(value, option) => {
              let unit = option.props.children.split('-');
              if(unit && unit[3]) {
                unit = unit[3].trim();
              }
              console.log(unit, this.props);
              return false;
            }}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            style={{ width: 200 }}
            placeholder="Chọn VT">
           {products.map((product) => {
              return <Select.Option 
              key={product.product_id} 
              value={product.product_id}> 
                {`${product.product_id} - ${product.name} - ${product.unit} `}
              </Select.Option>
           })}
          </Select>
        );
        break;
      case 'sl_thucnhap':
      case 'sl_chungtu':
      case 'price':
        return <InputNumber formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        break;
      case 'ngay_san_xuat':
      case 'ngay_het_han':
        return <DatePicker placeholder="Chọn ngày" format="DD/MM/YYYY"/>
        break;
      default:
        return <Input />;
        break;
    }
     
  };
  handleChange = (value) => { 
    console.log(value)
  }
  render() {
    const {
      editing,
      required,
      dataIndex,
      title,
      inputType,
      record,
      index,
      ...restProps
    } = this.props;
    return (
      <EditableContext.Consumer>
        {(form) => {
          const { getFieldDecorator } = form;
          let value;
          if(record) {
            value = record[dataIndex];
            if(dataIndex == 'ngay_san_xuat' || dataIndex == 'ngay_het_han') {
              value = moment(value);
              if(!value.isValid()) {
                value = null;// Might 	0000-00-00
              }
            }
          }
          return (
            <td {...restProps}>
              {editing ? (
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(dataIndex, {
                    rules: [{
                      required: required,
                      message: `Hãy nhập dữ liệu ô ${title}!`,
                    }],
                    initialValue: value,
                    
                  })(this.getInput())}
                </FormItem>
              ) : restProps.children}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      productList: {},
      selectedRowKeys: [], 
      loading: false,
      loadProduct: false
    };
    this.columns = [
      {
        title: 'Mã Lô',
        dataIndex: 'ma_lo',
        width: 120,
        //fixed: 'left',
        editable: true,
        required: false,
      },
      {
        title: 'Mã VT',
        dataIndex: 'product_id',
        //fixed: 'left',
        width: 150,
        editable: true,
        required: true,
        // render: (text, record) => {
        //   let label = text;
        //   if(this.state.productList && this.state.productList[text]) {
        //     label = this.state.productList[text]['name'];
        //   }
        //   return <span>{label}</span>
        // }
      },
      {
        title: 'Quy cách',
        dataIndex: 'label',
        width: 100,
        editable: true,
        required: true
      },
      {
        title: 'Đv',
        dataIndex: 'unit',
        //width: 100,
        editable: true,
      },
      {
        title: 'SL chứng từ',
        dataIndex: 'sl_chungtu',
        //width: '40%',
        width: 100,
        editable: true,
        render: (text, record) => `${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      },
      {
        title: 'SL thực',
        dataIndex: 'sl_thucnhap',
        //width: '40%',
        width: 100,
        editable: true,
        render: (text, record) => `${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      },
      {
        title: 'Đơn giá',
        dataIndex: 'price',
        //width: '40%',
        editable: true,
        required: true,
        render: (text, record) => `${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      },
      {
        title: 'Ngày SX',
        dataIndex: 'ngay_san_xuat',
        width: '200px',
        //width: '40%',
        editable: true,
        required: false,
        render: (text, record) => text ? moment(text).format('DD/MM/YYYY') : ''
      },
      {
        title: 'Ngày Hết Hạn',
        dataIndex: 'ngay_het_han',
        width: '200px',
        //width: '40%',
        editable: true,
        required: false,
        render: (text, record) => text? moment(text).format('DD/MM/YYYY') : ''
      },
      {
        title: 'QC Duyệt',
        dataIndex: 'qc_check',
        editable: false,
        width: 150,
        show: false,
        render: (text, record) => {
          return(
            <Select
              style={{width: 140}}
              onChange={(value) => {this.changeStatus('qc_check', record.id, value);}}
              value={text || '0'}>
              {qcQAStatus.map((option) => {
                return <Select.Option value={option.value} key={option.id}>{option.text}</Select.Option>
              })}
            </Select>
          );
        }
      },
      {
        title: 'QA Duyệt',
        dataIndex: 'qa_check',
        editable: false,
        width: 170,
        show: false,
        render: (text, record) => {
          return(
            <Select
              style={{width: 140}}
              onChange={(value) => {this.changeStatus('qa_check', record.id, value);}}
              value={text || '0'}>
              {qcQAStatus.map((option) => {
                return <Select.Option value={option.value} key={option.id}>{option.text}</Select.Option>
              })}
            </Select>
          );
        }
      },
      {
        title: 'Actions',
        dataIndex: 'operation',
        //fixed: 'right',
        width: 100,
        render: (text, record) => {
          let isReadOnly = this.isReadOnly();
          if(isReadOnly) return '';
          const editable = this.isEditing(record);
          return (
            <div style={{minWidth: 100}}>
              {editable ? (
                <span>
                  <EditableContext.Consumer>
                    {form => (
                      <a
                        href="javascript:;"
                        onClick={() => this.save(form, record.key)}
                        style={{ marginRight: 8 }}
                      >
                        Lưu
                      </a>
                    )}
                  </EditableContext.Consumer>
                  <Popconfirm
                    title="Bạn thật sự muốn huỷ?"
                    onConfirm={() => this.cancel(record.key)}
                  >
                    <a href="javascript:;">Huỷ</a>
                  </Popconfirm>
                </span>
              ) : (
                <React.Fragment>
                  <a href="javascript:;" onClick={() => this.edit(record.key)}>Sửa</a>  
                  {" | "}
                  <Popconfirm
                    title="Bạn thật sự muốn xoá?"
                    okType="danger"
                    onConfirm={() => this.delete(record)}
                  >
                    <a href="javascript:;">Xoá</a>  
                  </Popconfirm>
                </React.Fragment>
                
              )}
            </div>
          );
        },
      },
    ];
  }
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }
  changeStatus = (type, id, status) => {
    this.setState({ loading: true });
    // ajax request after empty completing
    let statusData = {
      id: id,
      type,
      status
    };
    fetch(ISD_BASE_URL + fetchConfig.changeStatus, {
      method: 'POST',
      headers: getTokenHeader(),
      body: JSON.stringify(statusData)
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
        this.fetchSelectedProduct();
        message.success(json.message);
      }
      this.setState({
        selectedRowKeys: [],
        loading: false,
      });
    }).catch((ex) => {
      console.log('parsing failed', ex)
      message.error('Có lỗi xảy ra trong quá trình lưu hoặc chỉnh sửa!');
    });
  }
  addNewRow() {
    let {products} = this.props.mainState.phieunhap;
    let {editingKey} = this.props.mainState.phieuAction;
    if(editingKey !== undefined && editingKey !== '') return false;
    let rowItem = this.getDefaultFields();
    rowItem = {
      ...rowItem,
      key: products.length + 1
    };
    
    this.props.dispatch(updateStateData({
      phieunhap: {
        ...this.props.mainState.phieunhap,
        products: [rowItem, ...products],
      },
      phieuAction: {
        ...this.props.mainState.phieuAction,
        editingKey: rowItem.key
      }
    }))
  }
  getDefaultFields() {
    return {
      ma_phieu: "",
      ma_lo: "",
      product_id: "",
      label: "",
      unit: "kg",
      sl_chungtu: "1",
      sl_thucnhap: "1",
      price: 0,
      qc_check: "0",
      qa_check: "0",
      ngay_het_han: "",
      ngay_san_xuat: ""
    };
  }
  isEditing = (record) => {
    return record.key === this.props.mainState.phieuAction.editingKey;
  };
  isReadOnly() {
    let {phieuAction} = this.props.mainState;
    return phieuAction && phieuAction.action == 'view' ? true : false;
  }
  edit(key) {
    this.props.dispatch(updateStateData({
      phieuAction: {
        ...this.props.mainState.phieuAction,
        editingKey: key
      }
    }));
  }
  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.props.mainState.phieunhap.products];
      let maPhieu = this.props.mainState.phieunhap.ma_phieu || '';
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        //console.log(item, row);//update to server here
        let newItemData = {
          ...item,
          ...row,
          ma_phieu: maPhieu,
          ngay_san_xuat: row['ngay_san_xuat'] ? row['ngay_san_xuat'].format('YYYY-MM-DD') : '',
          ngay_het_han: row['ngay_het_han'] ? row['ngay_het_han'].format('YYYY-MM-DD') : '',
        };
        //Chua co ma phieu va ID la trong
        if(!newData.id && !maPhieu) {
          newData.splice(index, 1, {
            ...newItemData
          });
          this.props.dispatch(updateStateData({
            phieunhap: {
              ...this.props.mainState.phieunhap,
              products: newData
            },
            phieuAction: {
              ...this.props.mainState.phieuAction,
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
                  phieunhap: {
                    ...this.props.mainState.phieunhap,
                    products: newData
                  },
                  phieuAction: {
                    ...this.props.mainState.phieuAction,
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
      phieuAction: {
        ...this.props.mainState.phieuAction,
        editingKey: ''
      }
    }));
  }
  delete = (record) => {
    if(record.id) {
      fetch(ISD_BASE_URL + fetchConfig.delete + record.id, {
        headers: getTokenHeader()
      })
      .then((response) => response.json())
      .then((json) => {
        if(json.status == 'error') {
          message.error('Có lỗi xảy ra khi xoá sản phẩm!', 3);
        } else {
          let newData = this.props.mainState.phieunhap.products.filter((item) => item.key != record.id);
          this.props.dispatch(updateStateData({
            phieunhap: {
              ...this.props.mainState.phieunhap,
              products: newData
            }
          }));
          message.success(json.message);
        }
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra khi xoá sản phẩm!', 3);
        console.log(error);
      });
    } else {
      if(record.key) {
        let newData = this.props.mainState.phieunhap.products.filter((item) => item.key != record.key);
        this.props.dispatch(updateStateData({
          phieunhap: {
            ...this.props.mainState.phieunhap,
            products: newData
          }
        }));
      }  
    }
  }
  fetchProduct() {
    fetch(ISD_BASE_URL + 'phieunhap/fetchProductDetailsList', {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            products: json.data
          }));
          this.setState({
            productList: convertArrayObjectToObject(json.data)
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
  fetchSelectedProduct() {
    let {phieunhap} = this.props.mainState;
    let maPhieu = phieunhap.ma_phieu;
    this.setState({loadProduct: true});
    fetch(ISD_BASE_URL + `phieunhap/fetchSelectedProduct/${maPhieu}`, {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            phieunhap: {
              ...this.props.mainState.phieunhap,
              products: json.data
            }
          }));          
        }
      } else {
        message.error(json.message);
        this.props.dispatch(updateStateData({
          phieunhap: {
            ...this.props.mainState.phieunhap,
            products: []
          }
        }));
      }
      this.setState({loadProduct: false});
    })
    .catch((error) => {
      console.log(error);
    });
  }
  componentDidMount() {
    let {products, phieunhap} = this.props.mainState;
    if(!products.length) {
      this.fetchProduct();
    }
    if(phieunhap.ma_phieu) {
      this.fetchSelectedProduct();
    }
  }
  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    let {phieuAction} = this.props.mainState;
    let products = this.props.mainState.products;
    let columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.dataIndex,
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
          required: col.required,
          products,
        }),
      };
    });
    //Show and hide some columns by roles
    columns = columns.filter((column) => {
      if(phieuAction.editingKey && phieuAction.editingKey != "") {
        if(column.dataIndex == 'qa_check' || column.dataIndex == 'qc_check') return false;
      }
      return true;
    })
    let selectedProducts = this.props.mainState.phieunhap.products || [];
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
            {!this.isReadOnly() ? 
              <Col span={12}>
                <div className="action-btns">
                    <Button 
                    onClick={() => this.addNewRow()}
                    type="primary" icon="plus">{tableConfig.addNewTitle}</Button> 
                </div>
              </Col>
            : null}
          </Row>
        </div>
        {/* { (this.props.isQA || this.props.isQC) ?
          this.getActionsByRoles() : null
        } */}
        <Table
          rowSelection={rowSelection}
          components={components}
          bordered
          dataSource={selectedProducts}
          columns={columns}
          rowClassName="editable-row"
          loading={this.state.loadProduct}
          scroll={{ x: 1500 }}
        />
      </React.Fragment>
    );
  }
}

export default EditableTable