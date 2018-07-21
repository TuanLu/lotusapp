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
const fetchConfig = {
  changeStatus: 'phieunhap/changeStatus'
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
        title: 'Mã KH',
        dataIndex: 'ma',
        width: 100,
        //fixed: 'left',
      },
      {
        title: 'Mã quet',
        dataIndex: 'ma_maquet',
        width: 100,
        //fixed: 'left',
      },
      {
        title: 'SL cho 1000.000 viên/lọ/gói	',
        dataIndex: 'sl_1000',
        //width: '40%',
      },
      {
        title: 'Số lượng NVL cần',
        dataIndex: 'sl_nvl',
        //width: '40%',
      },
      {
        title: 'Hư hao',
        dataIndex: 'hu_hao',
        render: (text, record) => `${text}%`
      },
      {
        title: 'Đơn vị tính',
        dataIndex: 'unit',
        //width: '40%',
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
  componentDidMount() {
    //let {products, phieunhap} = this.props.mainState;
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
        <Table
          // rowSelection={rowSelection}
          //components={components}
          bordered
          dataSource={selectedProducts}
          columns={columns}
          rowClassName="editable-row"
          loading={this.state.loadProduct}
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