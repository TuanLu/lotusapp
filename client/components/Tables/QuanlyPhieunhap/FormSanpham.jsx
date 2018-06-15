import React from 'react'
import { 
  Table, Input, InputNumber, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject} from 'ISD_API'
import {updateStateData} from 'actions'

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const tableConfig = {
  headTitle: 'Sản phẩm của phiếu nhập',
  addNewTitle: 'Thêm sản phẩm vào phiếu nhập'
};

const fetchConfig = {
  fetch: 'phieunhap/fetch',
  update: 'phieunhap/updateProduct',
  delete: 'phieunhap/deleteProduct/'
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
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            style={{ width: 200 }}
            placeholder="Chọn sản phẩm">
           {products.map((product) => {
              return <Select.Option 
              key={product.id} 
              value={product.id}>
                {product.name}
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
      productList: {}
    };
    this.columns = [
      {
        title: 'Mã Lô',
        dataIndex: 'ma_lo',
        width: '10%',
        editable: true,
        required: true,
      },
      {
        title: 'Sản phẩm',
        dataIndex: 'product_id',
        //width: '10%',
        editable: true,
        required: true,
        render: (text, record) => {
          let label = text;
          if(this.state.productList && this.state.productList[text]) {
            label = this.state.productList[text]['name'];
          }
          return <span>{label}</span>
        }
      },
      {
        title: 'Tên, Nhãn, Quy cách',
        dataIndex: 'label',
        //width: '15%',
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
        title: 'Actions',
        dataIndex: 'operation',
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
      unit: "",
      sl_chungtu: "1",
      sl_thucnhap: "1",
      price: ""
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
          ma_phieu: maPhieu
        };
        //If not exists ID, then update to store state 
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
                this.setState({ data: newData, editingKey: '' });
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
  cancel = () => {
    this.props.dispatch(updateStateData({
      phieunhap: {
        ...this.props.mainState.phieunhap,
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
    fetch(ISD_BASE_URL + 'product/fetch', {
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
    let products = this.props.mainState.products;
    const columns = this.columns.map((col) => {
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
    let selectedProducts = this.props.mainState.phieunhap.products || [];
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
        <Table
          components={components}
          bordered
          dataSource={selectedProducts}
          columns={columns}
          rowClassName="editable-row"
        />
      </React.Fragment>
    );
  }
}

export default EditableTable