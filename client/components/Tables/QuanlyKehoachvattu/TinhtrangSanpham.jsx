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
import Timkiem from './Timkiem'

const checkStatusOptions = convertArrayObjectToObject(qcQAStatus);

const FormItem = Form.Item;
const tableConfig = {
  headTitle: 'Kế hoạch Vật Tư dài hạn',
  addNewTitle: 'Thêm vật tư'
};

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
        //fixed: 'left',
        width: 150,
        // render: (text, record) => {
        //   let label = text;
        //   if(this.state.productList && this.state.productList[text]) {
        //     label = this.state.productList[text]['name'];
        //   }
        //   return <span>{label}</span>
        // }
      },
      {
        title: 'Tên vật tư',
        dataIndex: 'name',
        //width: '40%',
      },
      {
        title: 'Số lượng NVL cần',
        dataIndex: 'sl_nvl',
        //width: '40%',
      },
      {
        title: 'Số lượng trong kho',
        dataIndex: 'sl_thucnhap',
        //width: '40%',
        render: (text, record) => {
          let status = "error";
          if(record.sl_thucnhap && record.sl_nvl) {
            if(parseFloat(record.sl_thucnhap) >= parseFloat(record.sl_nvl)) {
              status = 'success';
            }
          }
          return (
            <Badge 
              text={text || 0} 
              status={status}/>
          );
        }
      },
      {
        title: 'Mã Kho',
        dataIndex: 'ma_kho',
        //width: '40%',
      },
      {
        title: 'Ngày sản xuất',
        dataIndex: 'ngay_san_xuat',
        render: (text, record) => text ? moment(text).format('DD/MM/YYYY') : ''
      },
      {
        title: 'Ngày hết hạn',
        dataIndex: 'ngay_het_han',
        render: (text, record) => text ? moment(text).format('DD/MM/YYYY') : ''
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
  }
  isReadOnly() {
    let {phieuAction} = this.props.mainState;
    return phieuAction && phieuAction.action == 'view' ? true : false;
  }
  fetchAllProduct() {
    this.setState({loadProduct: true});
    fetch(ISD_BASE_URL + `khvt/fetchAllProduct`, {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            kehoachvt: {
              ...this.props.mainState.kehoachvt,
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
  componentDidMount() {
    //let {products, kehoachvt} = this.props.mainState;
    this.fetchAllProduct();
  }
  render() {
    // const components = {
    //   body: {
    //     row: EditableFormRow,
    //     cell: EditableCell,
    //   },
    // };
    
    let columns = this.columns;
    //Add filter 
    let {filteredInfo, searchText} = this.state;
    filteredInfo = filteredInfo || {};
    columns = columns.map((col) => {
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
    let selectedProducts = this.props.mainState.kehoachvt.products || [];
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
        <Table
          // rowSelection={rowSelection}
          //components={components}
          bordered
          dataSource={selectedProducts}
          columns={columns}
          rowClassName="editable-row"
          loading={this.state.loadProduct}
          size="small"
          // scroll={{ x: 1500 }}
          //expandRowByClick={true}
          onChange={this.handleChange}
          title={() => {
            return (
              <Timkiem loading={(loading) => {
                this.setState({loadProduct: loading});
              }}/>
            );
          }}
        />
      </React.Fragment>
    );
  }
}

export default EditableTable