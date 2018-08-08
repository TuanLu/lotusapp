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
        width: 150,
      },
      {
        title: 'Tên VT',
        dataIndex: 'name',
        width: 200,
      },
      {
        title: 'Mã kho',
        dataIndex: 'ma_kho',
        width: 200,
      },
      // {
      //   title: 'Vị trí kho',
      //   dataIndex: 'vi_tri_kho',
      //   width: 200,
      // },
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
        title: 'Số lượng tồn',
        dataIndex: 'sl_thucnhap',
        width: 150,
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
        //editable: true,
        //required: true,
        render: (text, record) => {
          let dates = text.split(',');
          let dateArr = dates.map((date) =>  moment(date).format('DD/MM/YYYY'));
          if(dateArr.length > 1) {
            return dateArr.join(',');
          }
          return dateArr;
        }
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
  fetchAllProduct() {
    this.setState({loadProduct: true});
    fetch(ISD_BASE_URL + `phieuxuat/fetchVerifyProducts`, {
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
  componentDidMount() {
    //let {products, phieuxuat} = this.props.mainState;
    this.fetchAllProduct();
  }
  render() {
    let columns = this.columns;
    //Add filter 
    let {filteredInfo, searchText} = this.state;
    filteredInfo = filteredInfo || {};
    let productsForExport = this.props.mainState.productsForExport || [];
    //Apply search if exists 
    //const reg = new RegExp(searchText, 'gi');
    if(searchText) {
      productsForExport = productsForExport.map((record) => {
        const match = record.product_id.toLowerCase().indexOf(searchText.toLowerCase());
        if (match == -1) {
          return null;
        }
        return {
          ...record,
          // product_id: (
          //   <span>
          //     {record.product_id.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((text, i) => (
          //       text.toLowerCase() === searchText.toLowerCase() ?
          //         <span key={i} className="highlight">{text}</span> : text // eslint-disable-line
          //     ))}
          //   </span>
          // ),
        };
      }).filter(record => !!record)
    }
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <React.Fragment>
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