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
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const tableConfig = {
  headTitle: 'Vật tư của phiếu xuất',
  addNewTitle: 'Thêm vật tư vào phiếu xuất'
};

const fetchConfig = {
  fetch: 'phieuxuat/fetch',
  update: 'phieuxuat/updateProduct',
  delete: 'phieuxuat/deleteProduct/',
}

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  getInput = () => {
    switch (this.props.inputType) {
      case 'sl_thucnhap':
      case 'sl_chungtu':
      case 'price':
        return <InputNumber onChange={(data) => {
          console.log('value change',data, this.props);
          if(this.props.id) {
            console.log(this.props);
          } else {
            console.log(this.props.record);
          }
        }}/>
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
        editable: false,
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
        editable: false,
      },
      {
        title: 'Đơn vị tính',
        dataIndex: 'unit',
        width: 100,
        editable: false,
      },
      {
        title: 'SL theo chứng từ',
        dataIndex: 'sl_chungtu',
        //width: '40%',
        editable: true,
      },
      {
        title: 'SL thực xuất',
        dataIndex: 'sl_thucnhap',
        //width: '40%',
        editable: true,
      },
      {
        title: 'Đơn giá',
        dataIndex: 'price',
        //width: '40%',
        editable: false,
        required: true
      },
      // {
      //   title: 'Ngày SX',
      //   dataIndex: 'ngay_san_xuat',
      //   width: '200px',
      //   //width: '40%',
      //   editable: false,
      //   required: true,
      //   render: (text, record) => moment(text).format('DD/MM/YYYY')
      // },
      // {
      //   title: 'Ngày Hết Hạn',
      //   dataIndex: 'ngay_het_han',
      //   width: '200px',
      //   //width: '40%',
      //   editable: false,
      //   required: true,
      //   render: (text, record) => moment(text).format('DD/MM/YYYY')
      // }
    ];
  }
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }
  openProductModal() {
    this.props.dispatch(updateStateData({
      phieuXuatAction: {
        ...this.props.mainState.phieuXuatAction,
        openModal: true
      }
    }))
  }
  addNewRow() {
    let {products} = this.props.mainState.phieuxuat;
    let {editingKey} = this.props.mainState.phieuXuatAction;
    if(editingKey !== undefined && editingKey !== '') return false;
    let rowItem = this.getDefaultFields();
    rowItem = {
      ...rowItem,
      key: products.length + 1
    };
    
    this.props.dispatch(updateStateData({
      phieuxuat: {
        ...this.props.mainState.phieuxuat,
        products: [rowItem, ...products],
      },
      phieuXuatAction: {
        ...this.props.mainState.phieuXuatAction,
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
    return record.key === this.props.mainState.phieuXuatAction.editingKey;
  };
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
    if(record.id) {
      fetch(ISD_BASE_URL + fetchConfig.delete + record.id, {
        headers: getTokenHeader()
      })
      .then((response) => response.json())
      .then((json) => {
        if(json.status == 'error') {
          message.error('Có lỗi xảy ra khi xoá sản phẩm!', 3);
        } else {
          let newData = this.props.mainState.phieuxuat.products.filter((item) => item.key != record.id);
          this.props.dispatch(updateStateData({
            phieuxuat: {
              ...this.props.mainState.phieuxuat,
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
        let newData = this.props.mainState.phieuxuat.products.filter((item) => item.key != record.key);
        this.props.dispatch(updateStateData({
          phieuxuat: {
            ...this.props.mainState.phieuxuat,
            products: newData
          }
        }));
      }  
    }
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
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
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
          editing: (col.dataIndex == "sl_chungtu" || col.dataIndex == "sl_thucnhap") ? true : false,
          required: col.required,
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
          //rowSelection={rowSelection}
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