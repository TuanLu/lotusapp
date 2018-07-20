import React from 'react'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message, Badge
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject, trangThaiPhieu} from 'ISD_API'
import {updateStateData} from 'actions'
import FormPhieunhap from './QuanlySanxuat/FormPhieunhap'
const trangThaiPhieuObj = convertArrayObjectToObject(trangThaiPhieu);
const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const tableConfig = {
  headTitle: 'Quản lý sản xuất',
  addNewTitle: 'Thêm lệnh sản xuất'
};

const fetchConfig = {
  fetch: 'sx/fetch',
  delete: 'sx/delete/'
}

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  getInput = () => {
    switch (this.props.inputType) {
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
      data: [], 
      addNewItem: false,
    };
    this.columns = [
      {
        title: 'Mã sản xuất',
        dataIndex: 'ma',
        //width: '15%',
        editable: false,
      },
      {
        title: 'Công đoạn',
        dataIndex: 'cong_doan',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Sản phẩm',
        dataIndex: 'ma_sp',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Cỡ lô',
        dataIndex: 'co_lo',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Số lô',
        dataIndex: 'so_lo',
        //width: '40%',
        editable: false,
      },
      {
        title: 'NSX',
        dataIndex: 'nsx',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Phê duyệt',
        children: [
          {
            title: 'PKHSX',
            dataIndex: 'pkhsx',
            render: (text, record) => {
              return (
                <Badge 
                text={text == "" ? "Chưa duyệt" : "Đã duyệt"} 
                status={text == "" ? "error" : "success"}/>
              );
            }
          },
          {
            title: 'PĐBCL',
            dataIndex: 'pdbcl',
            render: (text, record) => {
              return (
                <Badge 
                text={text == "" ? "Chưa duyệt" : "Đã duyệt"} 
                status={text == "" ? "error" : "success"}/>
              );
            }
          },
          {
            title: 'Giám đốc',
            dataIndex: 'gd',
            render: (text, record) => {
              return (
                <Badge 
                text={text == "" ? "Chưa duyệt" : "Đã duyệt"} 
                status={text == "" ? "error" : "success"}/>
              );
            }
          },
        ]
      },
      // {
      //   title: 'Tình trạng',
      //   dataIndex: 'status',
      //   //width: '40%',
      //   editable: false,
      //   render: (text, record) => {
      //     return trangThaiPhieuObj[text]['text'] || text;
      //   }
      // },
      {
        title: 'Actions',
        dataIndex: 'operation',
        render: (text, record) => {
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
                  <a href="javascript:;" onClick={() => this.view(record)}>Xem chi tiết</a> 
                  {
                    // <React.Fragment>
                    //   {" | "}
                    //   <Popconfirm
                    //     title="Bạn thật sự muốn xoá?"
                    //     okType="danger"
                    //     onConfirm={() => this.delete(record)}
                    //   >
                    //     <a href="javascript:;">Xoá</a>  
                    //   </Popconfirm>
                    // </React.Fragment>
                    } 
                </React.Fragment>
                
              )}
            </div>
          );
        },
      },
    ];
  }
  getDefaultFields() {
    return {
      id: '',
      ma_sx: '',
      ma: '',
      so: '',
      cong_doan: '',
      ma_sp: '',
      co_lo: '',
      so_lo: '',
      nsx: '',
      hd: '',
      dang_bao_che: '',
      so_dk: '',
      qcdg: '',
      dh: '',
      //pkhsx: '',
      //pdbcl: '',
      //gd: '',
      tttb_kltb: '',
      products: [],
      status: '',
    }
  }
  addNewRow() {
    this.props.dispatch(updateStateData({
      phieuAction: {
        ...this.props.mainState.phieuAction,
        addNewItem: true,
        action: 'edit',
        editingKey: '',
      },
      sx: this.getDefaultFields()
    }));
  }
  isEditing = (record) => {
    return record.key === this.state.editingKey;
  };
  view(phieu) {
    let {sx, phieuAction} = this.props.mainState;
    if(phieu && phieu.ma_sx && phieu.id) {
      this.props.dispatch(updateStateData({
        sx: {
          ...sx,
          ...phieu
        },
        phieuAction: {
          ...phieuAction,
          addNewItem: true,
          action: 'view'
        }
      }));
    }
  }
  fetchData() {
    fetch(ISD_BASE_URL + fetchConfig.fetch, {
      headers: getTokenHeader()
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.status == 'error') {
        message.warning(json.message, 3);
      } else {
        if(json.data) {
          //Add key prop for table
          let data = json.data.map((item, index) => ({...item, key: index}) );
          this.setState({
            data,
            dataUpToDate: true
          });
          //Stop after fetching data
          this.props.dispatch(updateStateData({
            sx: {
              refresh: false
            }
          }));
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu sản phẩm!', 3);
      console.log(error);
    }); 
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
          let newData = this.state.data.filter((item) => item.id != json.data);
          this.setState({data: newData});
          message.success(json.message);
        }
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra khi xoá sản phẩm!', 3);
        console.log(error);
      });
    } else {
      if(record.key) {
        let newData = this.state.data.filter((item) => item.key != record.key);
        this.setState({
          data: newData
        })
      }  
    }
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    let {refresh} = nextProps.mainState.sx;
    if(refresh) {
      return {
        dataUpToDate: null
      }
    }
    return null;
  }
  componentDidUpdate() {
    if(this.state.dataUpToDate === null) {
      this.fetchData();
    }
  }
  componentDidMount() {
    this.fetchData();
  }
  render() {
    let {mainState} = this.props;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

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
        }),
      };
    });

    return (
      <React.Fragment>
        {mainState.phieuAction.addNewItem ? 
          <FormPhieunhap
            dispatch={this.props.dispatch}
            mainState={this.props.mainState}
          />
          : 
          <React.Fragment>

            <div className="table-operations">
              <Row>
                <Col span={12}>
                  <h2 className="head-title">{tableConfig.headTitle}</h2>
                </Col>
                <Col span={12}>
                  <div className="action-btns">
                    {
                     <Button 
                     onClick={() => this.addNewRow()}
                     type="primary" icon="plus">{tableConfig.addNewTitle}</Button>
                    }
                  </div>
                </Col>
              </Row>
            </div>
            <Table
              components={components}
              bordered
              dataSource={this.state.data}
              columns={columns}
              rowClassName="editable-row"
            />
          </React.Fragment>
        }
      </React.Fragment>
    );
  }
}

export default EditableTable