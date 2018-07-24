import React from 'react'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message, Badge
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject, trangThaiPhieu} from 'ISD_API'
import {updateStateData} from 'actions'
import Formkkvt from './QuanlyKiemke/Formkkvt'

const trangThaiPhieuObj = convertArrayObjectToObject(trangThaiPhieu);
const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const tableConfig = {
  headTitle: 'Quản lý kiểm kê',
  addNewTitle: 'Tạo phiếu mới'
};

const fetchConfig = {
  fetch: 'kkvt/fetch',
  delete: 'kkvt/delete/'
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
    let {userInfo} = this.props.mainState;
    this.columns = [
      {
        title: 'Ngày Tạo',
        dataIndex: 'create_on',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Mã Kho',
        dataIndex: 'ma_kho',
        //width: '15%',
        editable: false,
      },
      {
        title: 'Người kiểm kê',
        dataIndex: 'create_by',
        //width: '40%',
        editable: false,
        render: (text, record) => record.name || text
      },
      {
        title: 'Mô tả',
        dataIndex: 'note',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Người Duyệt',
        dataIndex: 'user_check',
        //render: (text, record) => record.name || text
      },
      {
        title: 'Tình trạng',
        dataIndex: 'tinh_trang',
        //width: '40%',
        editable: false,
        render: (text, record) => {
          let type = "processing";
          if(text == "0") type = "error";
          if(text == "1") type = "success";
          return <Badge 
            text={trangThaiPhieuObj[text]['text'] || text} 
            status={type}/>
        }
      },
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
                  {/* {(!this.isQA() && !this.isQC()) ? 
                    <React.Fragment>
                      {" | "}
                      <Popconfirm
                        title="Bạn thật sự muốn xoá?"
                        okType="danger"
                        onConfirm={() => this.delete(record)}
                      >
                        <a href="javascript:;">Xoá</a>  
                      </Popconfirm>
                    </React.Fragment>
                    : null}  */}
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
      ma_kho: '',
      ma_phieu: '',
      nguoi_giao_dich: '',
      so_chung_tu: '',
      note: '',
      address: '',
      products: [],
      tinh_trang: '2',//Chờ phê duyệt
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
      kkvt: this.getDefaultFields()
    }));
  }
  isQC() {
    let {userInfo} = this.props.mainState;
    let roles = userInfo.roles ? userInfo.roles.split(',') : [];   
    return roles.indexOf('nhomqc') !== -1;
  }
  isQA() {
    let {userInfo} = this.props.mainState;
    let roles = userInfo.roles ? userInfo.roles.split(',') : [];     
    return roles.indexOf('nhomqa') !== -1;
  }
  isInventoryOwner() {
    let {userInfo} = this.props.mainState;
    let roles = userInfo.roles ? userInfo.roles.split(',') : [];     
    return roles.indexOf('nhom_thu_kho') !== -1;
  }
  isEditing = (record) => {
    return record.key === this.state.editingKey;
  };
  view(phieu) {
    let {kkvt, phieuAction} = this.props.mainState;
    if(phieu && phieu.ma_phieu && phieu.id) {
      this.props.dispatch(updateStateData({
        kkvt: {
          ...kkvt,
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
            kkvt: {
              ...this.props.mainState.kkvt,
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
  delete = () => {
    let {id} = this.props.mainState.kkvt;
    if(id) {
      fetch(ISD_BASE_URL + fetchConfig.delete + id, {
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
          this.props.dispatch(updateStateData({
            kkvt: {},
            phieuAction: {
              ...this.props.mainState.phieuAction,
              addNewItem: false
            }
          }));
        }
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra khi xoá sản phẩm!', 3);
        console.log(error);
      });
    }
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    let {refresh} = nextProps.mainState.kkvt;
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
          <Formkkvt
            onDelete={() => this.delete()}
            isInventoryOwner={this.isInventoryOwner()}
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
                    <Button 
                     onClick={() => this.addNewRow()}
                     type="primary" icon="plus">{tableConfig.addNewTitle}</Button>
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