import React from 'react'
import moment from 'moment'
import { 
  Table, Input, InputNumber, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message, Alert,
  Menu, Dropdown, Icon, DatePicker
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
  headTitle: 'Vật tư kiểm kê',
  addNewTitle: 'Kiểm kê vật tư'
};

const fetchConfig = {
  fetch: 'kkvt/fetch',
  update: 'kkvt/updateProduct',
  delete: 'kkvt/deleteProduct/',
  changeStatus: 'kkvt/changeStatus'
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
      // {
      //   title: 'Mã Lô',
      //   dataIndex: 'ma_lo',
      //   width: 120,
      //   //fixed: 'left',
      //   editable: true,
      //   required: false,
      // },
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
        width: 200,
        editable: true,
        required: true
      },
      {
        title: 'ĐVT',
        dataIndex: 'unit',
        width: 100,
        editable: true,
      },
      {
        title: 'SL tồn',
        dataIndex: 'sl_chungtu',
        width: '120',
        editable: true,
        render: (text, record) => `${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      },
      {
        title: 'SL thực tế',
        dataIndex: 'sl_thucnhap',
        width: '120',
        editable: true,
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
      // {
      //   title: 'QC Duyệt',
      //   dataIndex: 'qc_check',
      //   editable: false,
      //   width: 170,
      //   show: false,
      //   render: (text, record) => {
      //     return this.showCheckStatus(text);
      //   }
      // },
      // {
      //   title: 'QA Duyệt',
      //   dataIndex: 'qa_check',
      //   editable: false,
      //   width: 170,
      //   show: false,
      //   render: (text, record) => {
      //     return this.showCheckStatus(text);
      //   }
      // },
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
  changeStatus = (status, type) => {
    this.setState({ loading: true });
    // ajax request after empty completing
    let statusData = {
      ids: this.state.selectedRowKeys,
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
  showCheckStatus(text) {
    if(text) {
      let type = "info";
      if(text == "2") type = "error";
      if(text == "1") type = "success";
      return (
        <Alert 
            message={checkStatusOptions[text]['text']} 
            type={type}
            showIcon />
      );
    }
    return <Alert 
            message={checkStatusOptions[0]['text']} 
            type={"info"}
            showIcon />
  }
  addNewRow() {
    let {products} = this.props.mainState.kkvt;
    let {editingKey} = this.props.mainState.phieuAction;
    if(editingKey !== undefined && editingKey !== '') return false;
    let rowItem = this.getDefaultFields();
    rowItem = {
      ...rowItem,
      key: products.length + 1
    };
    
    this.props.dispatch(updateStateData({
      kkvt: {
        ...this.props.mainState.kkvt,
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
      product_id: "",
      label: "",
      ma_lo: "",
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
      const newData = [...this.props.mainState.kkvt.products];
      let maPhieu = this.props.mainState.kkvt.ma_phieu || '';
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
            kkvt: {
              ...this.props.mainState.kkvt,
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
                  kkvt: {
                    ...this.props.mainState.kkvt,
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
          let newData = this.props.mainState.kkvt.products.filter((item) => item.key != record.id);
          this.props.dispatch(updateStateData({
            kkvt: {
              ...this.props.mainState.kkvt,
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
        let newData = this.props.mainState.kkvt.products.filter((item) => item.key != record.key);
        this.props.dispatch(updateStateData({
          kkvt: {
            ...this.props.mainState.kkvt,
            products: newData
          }
        }));
      }  
    }
  }
  fetchProduct() {
    fetch(ISD_BASE_URL + 'kkvt/fetchProductDetailsList', {
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
    let {kkvt} = this.props.mainState;
    let maPhieu = kkvt.ma_phieu;
    this.setState({loadProduct: true});
    fetch(ISD_BASE_URL + `kkvt/fetchSelectedProduct/${maPhieu}`, {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            kkvt: {
              ...this.props.mainState.kkvt,
              products: json.data
            }
          }));          
        }
      } else {
        message.error(json.message);
        this.props.dispatch(updateStateData({
          kkvt: {
            ...this.props.mainState.kkvt,
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
  getStatusMenu(type) {
    const menuItems = qcQAStatus.map((item) => {
      return (
        <Menu.Item key={item.id}>
          <a 
            onClick={() => {
              this.changeStatus(item.id, type);
            }}
            rel="noopener noreferrer">{item ? item.text : ''}</a>
        </Menu.Item>
      );
    });
    const menu = (
      <Menu>
       {menuItems}
      </Menu>
    );
    return menu;
  }
  getActionsByRoles() {
    let {selectedRowKeys, loading} = this.state;
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div style={{ marginBottom: 16 }}>
        {this.props.isQC? 
        <Dropdown className="qc_button_check" overlay={this.getStatusMenu('qc_check')} trigger={['click']} disabled={!hasSelected}>
          <Button
            type="primary"
            //onClick={this.start}
            loading={loading}
          >
            QC Phê duyệt
          </Button>
        </Dropdown>
        : null}
        {this.props.isQA? 
          <Dropdown className="qc_button_check" overlay={this.getStatusMenu('qa_check')} trigger={['click']} disabled={!hasSelected}>
           <Button
             type="primary"
             //onClick={this.start}
             loading={loading}
           >
             QA Phê duyệt
           </Button>
          </Dropdown>
        : null} 
        <span style={{ marginLeft: 8 }}>
          {hasSelected ? `Đã chọn ${selectedRowKeys.length} vật tư` : ''}
        </span>
      </div>
    );
  }
  componentDidMount() {
    let {products, kkvt} = this.props.mainState;
    if(!products.length) {
      this.fetchProduct();
    }
    if(kkvt.ma_phieu) {
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
      if(this.props.isQA || this.props.isQC) {
        if(column.dataIndex == 'operation') return false;
        if(this.props.isQC) {
          if(column.dataIndex == 'qa_check') return false;
        }
      }
      return true;
    })
    let selectedProducts = this.props.mainState.kkvt.products || [];
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