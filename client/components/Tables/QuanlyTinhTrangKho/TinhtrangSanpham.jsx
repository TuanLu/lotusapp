import React from 'react'
import { 
  Table, Input, InputNumber, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message,
  Menu, Dropdown, Icon, Badge
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
  headTitle: 'Vật tư trong kho',
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
                {`${product.product_id} - ${product.name} - ${product.unit} `}
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
        title: 'Mã VT',
        dataIndex: 'product_id',
        fixed: 'left',
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
        title: 'Mã Lô',
        dataIndex: 'ma_lo',
        width: 100,
        //fixed: 'left',
        editable: true,
        required: true,
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
        title: 'SL theo chứng từ',
        dataIndex: 'sl_chungtu',
        //width: '40%',
        editable: true,
      },
      {
        title: 'SL thực nhập',
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
        width: 130,
        fixed: 'right',
        render: (text, record) => {
          return this.showCheckStatus(text);
        }
      },
      {
        title: 'QA Duyệt',
        dataIndex: 'qa_check',
        editable: false,
        width: 130,
        fixed: 'right',
        render: (text, record) => {
          return this.showCheckStatus(text);
        }
      }
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
      let type = "processing";
      if(text == "2") type = "error";
      if(text == "1") type = "success";
      return (
        <Badge 
            text={checkStatusOptions[text]['text']} 
            status={type}/>
      );
    }
    return <Badge 
            text={checkStatusOptions[0]['text']} 
            status={"processing"}/>
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
  fetchSelectedProduct() {
    this.setState({loadProduct: true});
    fetch(ISD_BASE_URL + `tinhtrangkho/fetchAllProduct`, {
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
    if(!this.props.isQA && !this.props.isQC) return false;
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
    //let {products, phieunhap} = this.props.mainState;
    this.fetchSelectedProduct();
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
        <div className="table-operations no-margin">
          <Row>
            <Col span={12}>
              <h2 className="head-title">{tableConfig.headTitle}</h2>
            </Col>
            <Col span={12}>
              
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
          scroll={{ x: 1300 }}
        />
      </React.Fragment>
    );
  }
}

export default EditableTable