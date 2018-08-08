import React from 'react'
import moment from 'moment'
import { 
  Table, Input, InputNumber, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message,
  Menu, Dropdown, Icon, Badge, Modal
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject, qcQAStatus} from 'ISD_API'
import {updateStateData} from 'actions'
import FormChuyenViTri from './FormChuyenViTri'
import Timkiem from './Timkiem'
import FormPheduyet from './FormPheduyet'

const checkStatusOptions = convertArrayObjectToObject(qcQAStatus);

const FormItem = Form.Item;

const tableConfig = {
  headTitle: 'Vật tư trong kho',
  addNewTitle: 'Thêm vật tư vào phiếu nhập'
};

const fetchConfig = {
  changeStatus: 'phieunhap/changeStatus'
}

class TinhtrangSanpham extends React.Component {
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
      {
        title: 'Tên Kho',
        dataIndex: 'ten_kho',
        width: 200,
        //fixed: 'left',
      },
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
        //filterable: true,
        ///filters: qcQAStatus,
        //filterMultiple: false,
        width: 130,
        //fixed: 'right',
        render: (text, record) => {
          let btnStatus;
          switch (record.qc_check) {
            case "1":
              btnStatus = <Badge status="success" text={`Đạt`} />;
              break;
            case "0": 
              btnStatus = <Badge status="error" text={`Không đạt`} />;
              break;
            case "2":
              btnStatus = <Badge status="processing" text={`Phê duyệt`} />;
              break;
          }
          return <Button 
            //type="primary"
            onClick={() => {
              this.props.dispatch(updateStateData({
                phieunhap: {
                  ...this.props.mainState.phieunhap,
                  pheduyet: {
                    ...this.props.mainState.phieunhap.pheduyet,
                    ...record,
                    verifyType: 'qc_check',
                    openModal: true
                  }
                }
              }));
            }}>{btnStatus}</Button>
        }
      },
      {
        title: 'QA Duyệt',
        dataIndex: 'qa_check',
        editable: false,
        //filterable: true,
        //filters: qcQAStatus,
        //filterMultiple: false,
        width: 130,
        //fixed: 'right',
        render: (text, record) => {
          let btnStatus;
          switch (record.qa_check) {
            case "1":
              btnStatus = <Badge status="success" text={`Đạt`} />;
              break;
            case "0": 
              btnStatus = <Badge status="error" text={`Không đạt`} />;
              break;
            case "2":
              btnStatus = <Badge status="processing" text={`Phê duyệt`} />;
              break;
          }
          return <Button 
            //type="primary"
            onClick={() => {
              this.props.dispatch(updateStateData({
                phieunhap: {
                  ...this.props.mainState.phieunhap,
                  pheduyet: {
                    ...this.props.mainState.phieunhap.pheduyet,
                    ...record,
                    verifyType: 'qa_check',
                    openModal: true
                  }
                }
              }));
            }}>{btnStatus}</Button>
        }
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
  changeStatus = (type, id, status, note, file) => {
    this.setState({ loading: true });
    // ajax request after empty completing
    let statusData = {
      id: id,
      type,
      status,
      note,
      file
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
        this.closeVerifyModal();
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
  closeVerifyModal() {
    this.props.dispatch(updateStateData({
      phieunhap: {
        ...this.props.mainState.phieunhap,
        pheduyet: {
          ...this.props.mainState.phieunhap.phieunhap,
          openModal: false
        }
      }
    }));
  }
  exportExcel() {
    let {phieunhap} = this.props.mainState;
    let dataset = phieunhap.products ? phieunhap.products : [];
    if(dataset.length) {
      //Format dataset before export 
      dataset = dataset.map((item) => {
        return {
          ["Mã SP"]: item.product_id,
          ["Tên Kho"]: item.ten_kho,
          ["Số lượng"]: item.sl_thucnhap,
          ["Ngày sản xuất"]: item.ngay_san_xuat ?  moment(item.ngay_san_xuat).format('DD/MM/YYYY') : '',
          ["Ngày hết hạn"]: item.ngay_het_han ?  moment(item.ngay_het_han).format('DD/MM/YYYY') : '',
          ["QC Kiểm tra"]: item.qc_check == 1 ? 'Đạt' : 'Không đạt',
          ["QA Kiểm tra"]: item.qa_check == 1 ? 'Đạt' : 'Không đạt'
        }
      });
      //End format 
      let exportData = {
        dataset,
        title: 'Tình trạng kho',
        filename: 'Tình trạng kho'
      };
      fetch(ISD_BASE_URL + 'exportExcel', {
        method: 'POST',
        headers: getTokenHeader(),
        body: JSON.stringify(exportData)
      })
      .then((response) => {
        return response.json()
      }).then((json) => {
        if(json.status == 'error') {
          message.error(json.message, 3);
        } else {
          message.success(json.message);
          if(json.filename) {
            window.location.href = ISD_BASE_URL + `export/${json.filename}`;
          }
        }
      }).catch((ex) => {
        console.log('parsing failed', ex)
        message.error('Có lỗi xảy ra trong quá trình export!');
      });
    } else {
      message.error('Không có dữ liệu để export!');
    }
  }
  componentDidMount() {
    //let {products, phieunhap} = this.props.mainState;
    this.fetchAllProduct();
  }
  render() {
    let {products, phieunhap} = this.props.mainState;
    let pheduyet = phieunhap.pheduyet || {};
    let columns = this.columns;
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
    if(searchText) {
      selectedProducts = selectedProducts.map((record) => {
        let fullText = `${record.product_id}`;
        const match = fullText.toLowerCase().indexOf(searchText.toLowerCase());
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
    return (
      <React.Fragment>
        <div className="table-operations no-margin">
          <Row>
            <Col span={12}>
              <h2 className="head-title">{tableConfig.headTitle}</h2>
            </Col>
            <Col span={12}>
              <div className="action-btns">
                <Form>
                  <Button onClick={() => this.exportExcel()} type="primary"> <Icon type="file-excel" />Xuất Excel</Button>
                </Form>
              </div>
            </Col>
          </Row>
        </div>
        {pheduyet.openModal? 
          <Modal
            width={"60%"}
            style={{top: 20}}
            title={"Form phê duyệt sản phẩm"}
            visible={pheduyet.openModal}
            onCancel={() => {
              this.closeVerifyModal();
            }}
            onOk={() => {
              
            }}
            footer={null}
            >
            <FormPheduyet 
              changeStatus={this.changeStatus}
              mainState={this.props.mainState} 
              dispatch={this.props.dispatch} />
          </Modal>  
        : null}
        <Table
          //rowSelection={rowSelection}
          //components={components}
          bordered
          dataSource={selectedProducts}
          columns={columns}
          rowClassName="editable-row"
          loading={this.state.loadProduct}
          size="small"
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

export default TinhtrangSanpham