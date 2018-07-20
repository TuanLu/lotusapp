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
  headTitle: 'Nguyên liệu',
  addNewTitle: 'Thêm'
};

const fetchConfig = {
  fetch: 'sx/fetch',
  update: 'sx/updateProduct',
  delete: 'sx/deleteProduct/',
  changeStatus: 'sx/changeStatus'
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
      case 'sl_1000':
      case 'sl_nvl':
      case 'price':
        return <InputNumber formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        break;
      case 'hu_hao' :
        return <InputNumber min={0} max={100} formatter={value => `${value}%`} parser={value => value.replace('%', '')} />
        break;
      case 'nsx':
      case 'hd':
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
        title: 'Công đoạn',
        dataIndex: 'cong_doan',
        width: 200,
        //fixed: 'left',
        editable: true,
        required: false,
      },
      {
        title: 'Mã maquet',
        dataIndex: 'ma_maquet',
        width: 200,
        editable: true,
        required: true
      },
      {
        title: 'Mã NL',
        dataIndex: 'product_id',
        width: '20%',
        editable: true,
        render: (text, record) => { 
          let label = text, unit = 'kg';
          if(this.state.productList && this.state.productList[text]) {
            label = this.state.productList[text]['name'];
            unit = this.state.productList[text]['unit'];
          }
          return <span>{text} - {label} - {unit}</span>
        }
      },
      {
        title: 'SL cho 1000.000 viên/lọ/gói',
        dataIndex: 'sl_1000',
        //width: '40%',
        editable: true,
        render: (text, record) => `${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      },
      {
        title: 'Hư hao',
        dataIndex: 'hu_hao',
        width: '100',
        editable: true,
        render: (text, record) => `${text}%`
      },
      {
        title: 'SL NVL cần',
        dataIndex: 'sl_nvl',
        //width: '40%',
        editable: true,
        required: true,
        render: (text, record) => `${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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
    let {products} = this.props.mainState.sx || [];
    let {editingKey} = this.props.mainState.phieuAction;
    if(editingKey !== undefined && editingKey !== '') return false;
    let rowItem = this.getDefaultFields();
    rowItem = {
      ...rowItem,
      key: products.length + 1
    };
    
    this.props.dispatch(updateStateData({
      sx: {
        ...this.props.mainState.sx,
        products: [...products, rowItem],
      },
      phieuAction: {
        ...this.props.mainState.phieuAction,
        editingKey: rowItem.key
      }
    }))
  }
  getDefaultFields() {
    return {
      ma_sx: "",
      ma_maquet: "",
      product_id: "",
      cong_doan: "",
      sl_1000: "",
      sl_nvl: "",
      hu_hao: "",
      status: "",
      create_on: ""
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
      const newData = [...this.props.mainState.sx.products];
      let maPhieu = this.props.mainState.sx.ma_sx || '';
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        //console.log(item, row);//update to server here
        let newItemData = {
          ...item,
          ...row,
          ma_sx: maPhieu,
        };
        //Chua co ma phieu va ID la trong
        if(!newData.id && !maPhieu) {
          newData.splice(index, 1, {
            ...newItemData
          });
          this.props.dispatch(updateStateData({
            sx: {
              ...this.props.mainState.sx,
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
                  sx: {
                    ...this.props.mainState.sx,
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
          let newData = this.props.mainState.sx.products.filter((item) => item.key != record.id);
          this.props.dispatch(updateStateData({
            sx: {
              ...this.props.mainState.sx,
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
        let newData = this.props.mainState.sx.products.filter((item) => item.key != record.key);
        this.props.dispatch(updateStateData({
          sx: {
            ...this.props.mainState.sx,
            products: newData
          }
        }));
      }  
    }
  }
  fetchProduct() {
    fetch(ISD_BASE_URL + 'sx/fetchProductDetailsList', {
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
            productList: convertArrayObjectToObject(json.data, `product_id`)
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
    let {sx} = this.props.mainState;
    let maPhieu = sx.ma_sx;
    this.setState({loadProduct: true});
    fetch(ISD_BASE_URL + `sx/fetchSelectedProduct/${maPhieu}`, {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            sx: {
              ...this.props.mainState.sx,
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
  componentDidMount() {
    let {products, sx} = this.props.mainState;
    if(!products.length) {
      this.fetchProduct();
    }
    if(sx.ma_sx) {
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
    let selectedProducts = this.props.mainState.sx.products || [];
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
        <Table
          rowSelection={rowSelection}
          components={components}
          bordered
          dataSource={selectedProducts}
          columns={columns}
          rowClassName="editable-row"
          loading={this.state.loadProduct}
        />
      </React.Fragment>
    );
  }
}

export default EditableTable