import React from 'react'
import moment from 'moment'
import { 
  Table, Input, InputNumber, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message,
  Menu, Dropdown, Icon, Badge
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject, qcQAStatus} from 'ISD_API'
import {updateStateData} from 'actions'
import FormChuyenViTri from './FormChuyenViTri'
import Timkiem from './Timkiem'

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
      loadProduct: false,
      filteredInfo: null,
      filterDropdownVisible: false,
      searchText: '',
      filtered: false,
    };
    this.columns = [
      {
        title: 'Mã VT',
        dataIndex: 'product_id',
        width: 150,
        //fixed: 'left',
      },
      {
        title: 'Mã Kho',
        dataIndex: 'ma_kho',
        width: 100,
        //fixed: 'left',
      },
      // {
      //   title: 'Quy cách',
      //   dataIndex: 'label',
      //   width: 200,
      //   editable: true,
      //   required: true
      // },
      // {
      //   title: 'Đơn vị tính',
      //   dataIndex: 'unit',
      //   //width: '40%',
      //   editable: true,
      // },
      // {
      //   title: 'SL theo chứng từ',
      //   dataIndex: 'sl_chungtu',
      //   //width: '40%',
      //   editable: true,
      // },
      {
        title: 'SL',
        dataIndex: 'sl_thucnhap',
        width: 120,
        //width: '40%',
        editable: true,
      },
      // {
      //   title: 'Đơn giá',
      //   dataIndex: 'price',
      //   width: 200,
      //   editable: true,
      //   required: true
      // },
      {
        title: 'Ngày SX',
        dataIndex: 'ngay_san_xuat',
        width: '200px',
        //width: '40%',
        editable: true,
        required: true,
        render: (text, record) => moment(text).format('DD/MM/YYYY')
      },
      {
        title: 'Ngày hết hạn',
        dataIndex: 'ngay_het_han',
        width: '200px',
        //width: '40%',
        editable: true,
        required: true,
        render: (text, record) => moment(text).format('DD/MM/YYYY')
      },
      {
        title: 'QC Duyệt',
        dataIndex: 'qc_check',
        editable: false,
        filterable: true,
        filters: qcQAStatus,
        filterMultiple: false,
        width: 130,
        //fixed: 'right',
        render: (text, record) => {
          return this.showCheckStatus(text);
        }
      },
      {
        title: 'QA Duyệt',
        dataIndex: 'qa_check',
        editable: false,
        filterable: true,
        filters: qcQAStatus,
        filterMultiple: false,
        width: 130,
        //fixed: 'right',
        render: (text, record) => {
          return this.showCheckStatus(text);
        }
      }
    ];
  }
  onInputChange = (e) => {
    this.setState({ searchText: e.target.value });
  }
  onSearch = () => {
    const { searchText } = this.state;
    const reg = new RegExp(searchText, 'gi');
    this.setState({
      filterDropdownVisible: false,
      filtered: !!searchText,
      // data: data.map((record) => {
      //   const match = record.product_id.match(reg);
      //   if (!match) {
      //     return null;
      //   }
      //   return {
      //     ...record,
      //     product_id: (
      //       <span>
      //         {record.product_id.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((text, i) => (
      //           text.toLowerCase() === searchText.toLowerCase() ?
      //             <span key={i} className="highlight">{text}</span> : text // eslint-disable-line
      //         ))}
      //       </span>
      //     ),
      //   };
      // }).filter(record => !!record),
    });
  }
  handleChange = (pagination, filters, sorter) => {
    //console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
    });
  }
  clearFilters = () => {
    this.setState({ filteredInfo: null });
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
        this.fetchAllProduct();
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
  fetchAllProduct() {
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
  componentDidMount() {
    //let {products, phieunhap} = this.props.mainState;
    this.fetchAllProduct();
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
    //Add filter 
    let {filteredInfo, searchText} = this.state;
    filteredInfo = filteredInfo || {};
    columns = columns.map((col) => {
      if(col.filterable) {
        switch (col.dataIndex) {
          case 'qc_check':
            return {
              ...col,
              filteredValue: filteredInfo.qc_check || null,
              onFilter: (value, record) => {
                return record.qc_check.includes(value)
              },
            }
            break;
          case 'qa_check':
            return {
              ...col,
              filteredValue: filteredInfo.qa_check || null,
              onFilter: (value, record) => {
                return record.qa_check.includes(value)
              },
            }
            break;
        }
      }
      //Search by product ID
      if(col.dataIndex == 'product_id') {
        return {
          ...col,
          filterDropdown: (
            <div className="custom-filter-dropdown">
              <Input
                ref={ele => this.searchInput = ele}
                placeholder="Nhập mã vật tư"
                value={this.state.searchText}
                onChange={this.onInputChange}
                onPressEnter={this.onSearch}
              />
              <Button type="primary" onClick={this.onSearch}>Tìm</Button>
            </div>
          ),
          filterIcon: <Icon type="search" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />,
          filterDropdownVisible: this.state.filterDropdownVisible,
          onFilterDropdownVisibleChange: (visible) => {
            this.setState({
              filterDropdownVisible: visible,
            }, () => this.searchInput && this.searchInput.focus());
          },
        }
      }
      return col;
    });
    let selectedProducts = this.props.mainState.phieunhap.products || [];
    //Apply search if exists 
    const reg = new RegExp(searchText, 'gi');
    if(searchText) {
      selectedProducts = selectedProducts.map((record) => {
        const match = record.product_id.match(reg);
        if (!match) {
          return null;
        }
        return {
          ...record,
          product_id: (
            <span>
              {record.product_id.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((text, i) => (
                text.toLowerCase() === searchText.toLowerCase() ?
                  <span key={i} className="highlight">{text}</span> : text // eslint-disable-line
              ))}
            </span>
          ),
        };
      }).filter(record => !!record)
    }
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
        {/* {this.getActionsByRoles()} */}
        <Table
          //rowSelection={rowSelection}
          components={components}
          bordered
          dataSource={selectedProducts}
          columns={columns}
          rowClassName="editable-row"
          loading={this.state.loadProduct}
          //scroll={{ x: 1500 }}
          //expandRowByClick={true}
          onChange={this.handleChange}
          title={() => {
            return (
              <Timkiem loading={(loading) => {
                this.setState({loadProduct: loading});
              }}/>
            );
          }}
          expandedRowRender={record => {
            return (
              <FormChuyenViTri
                mainState={this.props.mainState}
                dispatch={this.props.dispatch}
                record={record}
              />
            );
          }}
        />
      </React.Fragment>
    );
  }
}

export default EditableTable