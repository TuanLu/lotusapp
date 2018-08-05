import React from 'react'
import { 
  Table, Input, Select, Icon,
  Popconfirm, Form, Row, 
  Col, Button, message, Badge
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject, trangThaiPhieu, blankGanttData} from 'ISD_API'
import {updateStateData} from 'actions'
import FormRnd from './QuanlyRnd/FormRnd'
const trangThaiPhieuObj = convertArrayObjectToObject(trangThaiPhieu);
const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const fetchConfig = {
  fetch: 'rnd/fetchRnd',
  delete: 'rnd/delete/'
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
    let {ans_language} = this.props.mainState;
    this.columns = [
      {
        title: ans_language.ans_order || 'ans_order',
        dataIndex: 'orderid',
        //width: '15%',
        editable: false,
      },
      {
        title: ans_language.ans_product || 'ans_product',
        dataIndex: 'ma_sp',
        //width: '40%',
        editable: false,
      },
      {
        title: ans_language.ans_co_lo || 'ans_co_lo',
        dataIndex: 'co_lo',
        //width: '40%',
        editable: false,
      },
      {
        title: ans_language.ans_user_do_it || 'ans_user_do_it',
        dataIndex: 'userid',
        //width: '40%',
        editable: false,
      },
      {
        title: ans_language.ans_date_create || 'ans_date_create',
        dataIndex: 'create_on',
        //width: '40%',
        editable: false,
      },
      {
        title: ans_language.ans_approval_title || 'ans_approval_title',
        children: [
          {
            title: ans_language.ans_manager || 'ans_manager',
            dataIndex: 'pkhsx',
            render: (text, record) => {
              return (
                <Badge 
                text={!text ? ans_language.ans_unapproved || 'ans_unapproved' : ans_language.ans_approved || 'ans_approved'} 
                status={!text ? "error" : "success"}/>
              );
            }
          },
          {
            title: ans_language.ans_quality_assurance || 'ans_quality_assurance',
            dataIndex: 'pdbcl',
            render: (text, record) => {
              return (
                <Badge 
                text={!text ? ans_language.ans_unapproved || 'ans_unapproved' : ans_language.ans_approved || 'ans_approved'} 
                status={!text ? "error" : "success"}/>
              );
            }
          },
          {
            title: ans_language.ans_director || 'ans_director',
            dataIndex: 'gd',
            render: (text, record) => {
              return (
                <Badge 
                text={!text ? ans_language.ans_unapproved || 'ans_unapproved' : ans_language.ans_approved || 'ans_approved'} 
                status={!text ? "error" : "success"}/>
              );
            }
          },
        ]
      },
      {
        title: ans_language.ans_actions || 'ans_actions',
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
                         <Icon type="save" />{ans_language.ans_save || 'ans_save'}
                      </a>
                    )}
                  </EditableContext.Consumer>
                  <Popconfirm
                    title="Bạn thật sự muốn huỷ?"
                    onConfirm={() => this.cancel(record.key)}
                  >
                    <a href="javascript:;"><Icon type="cancel" />{ans_language.ans_cancel || 'ans_cancel'}</a>
                  </Popconfirm>
                </span>
              ) : (
                <React.Fragment>
                  <a href="javascript:;" onClick={() => this.view(record)}><Icon type="profile" />{ans_language.ans_detail || 'ans_detail'}</a> 
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
      ma_rnd: '',
      ma_nc: '',
      orderid: '',
      product_id: '',
      user_id: '',
      create_on: '',
      create_by: '',
      so_lo: '',
      nsx: '',
      hd: '',
      dang_bao_che: '',
      so_dk: '',
      qcdg: '',
      dh: '',
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
      rnd: this.getDefaultFields()
    }));
  }
  isEditing = (record) => {
    return record.key === this.state.editingKey;
  };
  view(phieu) {
    let {rnd, phieuAction} = this.props.mainState;
    if(phieu && phieu.ma_rnd && phieu.id) {
      this.props.dispatch(updateStateData({
        rnd: {
          ...rnd,
          ...phieu
        },
        phieuAction: {
          ...phieuAction,
          addNewItem: true,
          action: 'view'
        },
        ganttData: blankGanttData
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
              ...this.props.mainState.sx,
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
  fetchQuyTrinhMau() {
    fetch(ISD_BASE_URL + 'rnd/fetchRnd', {
      headers: getTokenHeader()
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.status == 'error') {
        message.warning(json.message, 3);
        if(json.show_login) {
          this.props.dispatch(updateStateData({showLogin: true}));
        }
      } else {
        if(json.data) {
          this.props.dispatch(updateStateData({
            quyTrinhSx: {
              ...this.props.mainState.quyTrinhSx,
              listQuyTrinh: json.data
            }
          }));
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu quy trình sản xuất!', 3);
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
    this.fetchQuyTrinhMau();
  }
  render() {
    let {mainState} = this.props;
    let ans_language = mainState.ans_language;
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
          <FormRnd
            dispatch={this.props.dispatch}
            mainState={this.props.mainState}
          />
          : 
          <React.Fragment>
            <div className="table-operations">
              <Row>
                <Col span={12}>
                  <h2 className="head-title">{ans_language.ans_rnd_title || 'ans_rnd_title'}</h2>
                </Col>
                <Col span={12}>
                  <div className="action-btns">
                    {
                     <Button 
                     onClick={() => this.addNewRow()}
                     type="primary" icon="plus">{ans_language.ans_add_new || 'ans_add_new'}</Button>
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