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

const checkStatusOptions = convertArrayObjectToObject(qcQAStatus);

const FormItem = Form.Item;

class VatTuPhieuXuat extends React.Component {
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
        title: 'Mã Kho',
        dataIndex: 'ma_kho',
        width: 100,
        //fixed: 'left',
        editable: true,
        required: true,
      },
      // {
      //   title: 'Mã Lô',
      //   dataIndex: 'ma_lo',
      //   width: 100,
      //   //fixed: 'left',
      //   editable: true,
      //   required: true,
      // },
      {
        title: 'Quy cách',
        dataIndex: 'label',
        width: 200,
        editable: true,
        required: true
      },
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
        width: 100,
        editable: true,
      },
      // {
      //   title: 'Đơn giá',
      //   dataIndex: 'price',
      //   //width: '40%',
      //   editable: true,
      //   required: true
      // },
      {
        title: 'Ngày Nhập Kho',
        dataIndex: 'create_on',
        width: '200px',
        //width: '40%',
        editable: true,
        required: true,
        render: (text, record) => moment(text).format('DD/MM/YYYY')
      },
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
    this.props.onRowSelection(selectedRowKeys);
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
            productsForExport: json.data
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
        <Dropdown className="qc_button_check" overlay={this.getStatusMenu('qc_check')} trigger={['click']} disabled={!hasSelected}>
          <Button
            type="primary"
            //onClick={this.start}
            loading={loading}
            style={{marginRight: 10}}
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
    //let {products, phieuxuat} = this.props.mainState;
    this.fetchAllProduct();
  }
  render() {
    let columns = this.columns;
    //Show and hide some columns by roles
    columns = columns.filter((column) => {
      if(this.props.isQA || this.props.isQC) {
        if(column.dataIndex == 'operation') return false;
        if(this.props.isQC) {
          if(column.dataIndex == 'qa_check') return false;
        }
      }
      return true;
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
    let productsForExport = this.props.mainState.productsForExport || [];
    //Apply search if exists 
    const reg = new RegExp(searchText, 'gi');
    if(searchText) {
      productsForExport = productsForExport.map((record) => {
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
        {this.getActionsByRoles()}
        <Table
          size={"small"}
          rowSelection={rowSelection}
          bordered
          dataSource={productsForExport}
          columns={columns}
          loading={this.state.loadProduct}
          scroll={{ y: 250 }}
          pagination={{ pageSize: 50 }}
          onChange={this.handleChange}
        />
      </React.Fragment>
    );
  }
}

export default VatTuPhieuXuat