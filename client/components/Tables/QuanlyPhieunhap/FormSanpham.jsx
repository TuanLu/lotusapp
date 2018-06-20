import React from 'react'
import { 
  Table, Input, InputNumber, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message, Alert,
  Menu, Dropdown, Icon
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
  headTitle: 'Vật tư của phiếu nhập',
  addNewTitle: 'Thêm vật tư vào phiếu nhập'
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
                {`${product.product_id} - ${product.category_name} - ${product.name} - ${product.unit} `}
              </Select.Option>
           })}
          </Select>
        );
        break;
      case 'sl_thucnhap':
      case 'sl_chungtu':
      case 'price':
        return <InputNumber/>
        break;
      default:
        return <Input />;
        break;
    }
    
  };
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
          return (
            <td {...restProps}>
              {editing ? (
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(dataIndex, {
                    rules: [{
                      required: required,
                      message: `Hãy nhập dữ liệu ô ${title}!`,
                    }],
                    initialValue: record[dataIndex],
                    
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
        width: 100,
        //fixed: 'left',
        editable: true,
        required: true,
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
        width: 200,
        editable: true,
        required: true
      },
      {
        title: 'Đơn vị tính',
        dataIndex: 'unit',
        //width: '40%',
        editable: true,
      },
      {
        title: 'Số lượng chứng từ',
        dataIndex: 'sl_chungtu',
        //width: '40%',
        editable: true,
      },
      {
        title: 'Số lượng thực nhập',
        dataIndex: 'sl_thucnhap',
        //width: '40%',
        editable: true,
      },
      {
        title: 'Đơn giá',
        dataIndex: 'price',
        //width: '40%',
        editable: true,
        required: true
      },
      {
        title: 'QC Duyệt',
        dataIndex: 'qc_check',
        editable: false,
        width: 200,
        show: false,
        render: (text, record) => {
          return this.showCheckStatus(text);
        }
      },
      {
        title: 'QA Duyệt',
        dataIndex: 'qa_check',
        editable: false,
        width: 150,
        show: false,
        render: (text, record) => {
          return this.showCheckStatus(text);
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
      qa_check: "0"
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
        console.log(item, row);//update to server here
        let newItemData = {
          ...item,
          ...row,
          ma_phieu: maPhieu
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
            rel="noopener noreferrer">{item.text}</a>
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
        <Dropdown overlay={this.getStatusMenu('qc_check')} trigger={['click']} disabled={!hasSelected}>
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
          <Dropdown overlay={this.getStatusMenu('qa_check')} trigger={['click']} disabled={!hasSelected}>
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
            <Col span={12}>
              <div className="action-btns">
                {!this.isReadOnly() ? 
                  <Button 
                  onClick={() => this.addNewRow()}
                  type="primary" icon="plus">{tableConfig.addNewTitle}</Button> : null}
              </div>
            </Col>
          </Row>
        </div>
        {this.getActionsByRoles()}
        <Table
          rowSelection={rowSelection}
          components={components}
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

export default EditableTable