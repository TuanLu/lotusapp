import React from 'react'
import moment from 'moment'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row,
  Col, Button, message, DatePicker, TimePicker
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject} from 'ISD_API'
import {updateStateData} from 'actions'

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  getInput = () => {
    switch (this.props.inputType) {
      case 'ma_kh':
        let khachhang = this.props.khachhang || [];
        return (
          <Select 
            style={{ width: 250 }}
            placeholder="Chọn khách hàng">
           {khachhang.map((khachhang) => {
              return <Select.Option 
              key={khachhang.id} 
              value={khachhang.name}>
                {`${khachhang.id} - ${khachhang.name}`}
              </Select.Option>
           })}
          </Select>
        );
        break;
      case 'product_id':
        let products = this.props.products;
        return (
          <Select 
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            style={{ width: 200 }}
            placeholder="Chọn VT">
           {products.map((product) => {
              return <Select.Option 
              key={product.id} 
              value={product.product_id}> 
                {`${product.product_id} - ${product.name} - ${product.unit} `}
              </Select.Option>
           })}
          </Select>
        );
        break;
      case 'workday':
        return <DatePicker placeholder="Chọn ngày" format="DD/MM/YYYY"/>;
      break;
      case 'timestart':
      case 'timestop':
        return <TimePicker placeholder="Chọn giờ" format="HH:mm:ss"/>;
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
          let value;
          if(record) {
            value = record[dataIndex];
            if(dataIndex == 'workday') {
              value = moment(value);
              if(!value.isValid()) {
                value = null;// Might 	0000-00-00
              }
            }else{
              if(dataIndex == 'timestart' || dataIndex == 'timestop') {
                //defaultValue={}
                value = moment(value, 'HH:mm:ss')
                if(!value.isValid()) {
                  value = null;// Might 	0000-00-00
                }
              }
            }
          }
          return (
            <td {...restProps}>
              {editing ? (
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(dataIndex, {
                    rules: [{
                      required: required,
                      message: `Hãy nhập dữ liệu ô ${title}!`,
                    }],
                    initialValue: value,
                    
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
      editingKey: '',
      newitem: 0
    };
    this.columns = [
      {
        title: 'Ngày tạo',
        dataIndex: 'workday',
        width: '15%',
        editable: true,
        required: true,
        render: (text, record) => moment(text).format('DD/MM/YYYY')
      },
      {
        title: 'Mã nhân viên',
        dataIndex: 'ma_ns',
        //width: '15%',
        editable: true,
        required: true
      },
      {
        title: 'Mã công việc',
        dataIndex: 'ma_cv',
        //width: '40%',
        editable: true,
      },
      {
        title: 'Giờ bắt đầu',
        dataIndex: 'timestart',
        //width: '40%',
        editable: true,
        render: (text, record) => moment(text, "HH:mm:ss").format("HH:mm:ss")//moment(text).format('HH:mm:ss')
      },
      {
        title: 'Giờ kết thúc',
        dataIndex: 'timestop',
        //width: '40%',
        editable: true,
        render: (text, record) => moment(text, "HH:mm:ss").format("HH:mm:ss")
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
                    onConfirm={() => this.cancel(record)}
                  >
                    <a href="javascript:;">Huỷ</a>
                  </Popconfirm>
                </span>
              ) : (
                <React.Fragment>
                  <a href="javascript:;" onClick={() => this.edit(record.key)}>Sửa</a>  
                  {" | "}
                  <Popconfirm
                    title="Bạn thật sự muốn xoá?"
                    okType="danger"
                    onConfirm={() => this.delete(record)}
                  >
                    <a href="javascript:;">Xoá</a>  
                  </Popconfirm>
                </React.Fragment>
                
              )}
            </div>
          );
        },
      },
    ];
  }
  addNewRow() {
    if(this.state.newitem == 0){
      let rowItem = this.getDefaultFields();
    rowItem = {
      ...rowItem,
      key: this.state.data.length + 1
    };
    this.setState({
      data: [rowItem, ...this.state.data],
      editingKey: rowItem.key
    })
    this.state.newitem = 1
    }else{
      message.error('Bạn đang thêm mới sản lượng rồi ...')
    }
  }
  getDefaultFields() {
    return {
      ma_sl: "",
      ma_ns: "",
      ma_cv: "",
      timestart: "",
      timestop: "",
      workday: "",
      ca: '',
      address: "",
      ot: ""
    };
  }
  isEditing = (record) => {
    return record.key === this.state.editingKey;
  };
  edit(key) {
    this.setState({ editingKey: key });
  }
  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.state.data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        //console.log(item, row);//update to server here
        let newItemData = {
          ...item,
          ...row,
          workday: row['workday'].format('DD/MM/YYYY'),
          timestart: row['timestart'].format('HH:mm:ss'),
          timestop: row['timestop'].format('HH:mm:ss'),
        };
        fetch(ISD_BASE_URL + 'qlsl/updateSl', {
          method: 'POST',
          headers: getTokenHeader(),
          body: JSON.stringify(newItemData)
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
            //udate table state
            newData.splice(index, 1, {
              ...newItemData,
              ...json.data
            });
            this.setState({ data: newData, editingKey: '' });
            message.success(json.message);
            this.state.newitem = 0;
          }
        }).catch((ex) => {
          console.log('parsing failed', ex)
          message.error('Có lỗi xảy ra trong quá trình lưu hoặc chỉnh sửa!');
        });
        //End up data to server
      } else {
        newData.push(data);
        this.setState({ data: newData, editingKey: '' });
      }
    });
  }
  cancel = (record) => {
    this.setState({ editingKey: '' });
    if(this.state.newitem == 1){
      this.state.newitem = 0;
      this.delete(record);
    }
  }
  delete = (record) => {
    if(record.id) {
      fetch(ISD_BASE_URL + 'qlsl/deleteSl/' + record.id, {
        headers: getTokenHeader()
      })
      .then((response) => response.json())
      .then((json) => {
        if(json.status == 'error') {
          message.error('Có lỗi xảy ra khi xoá sản lượng!', 3);
        } else {
          let newData = this.state.data.filter((item) => item.id != json.data);
          this.setState({data: newData});
          message.success(json.message);
          this.state.newitem = 0;
        }
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra khi xoá sản lượng!', 3);
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
  fetchData() {
    fetch(ISD_BASE_URL + 'qlsl/fetchSl', {
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
          this.setState({data});
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu sản lượng!', 3);
      console.log(error);
    }); 
  }
  fetchKhachhang() {
    fetch(ISD_BASE_URL + 'qlkh/fetchKh', {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            khachhang: json.data
          }));
          this.setState({
            khachhangList: convertArrayObjectToObject(json.data)
          });
          
        }
      } else {
        message.error(json.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }
  fetchProduct() {
    fetch(ISD_BASE_URL + 'product/fetch', {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            products: json.data
          }));
          this.setState({
            productList: convertArrayObjectToObject(json.data)
          });
          
        }
      } else {
        message.error(json.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }
  componentDidMount() {
    this.fetchKhachhang();
    this.fetchProduct();
    this.fetchData();
  }
  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    let products = this.props.mainState.products;
    let khachhang = this.props.mainState.khachhang;
    
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
          products,
          khachhang
        }),
      };
    });

    return (
      <React.Fragment>
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">Quản lý sản lượng hàng ngày</h2>
            </Col>
            <Col span={12}>
              <div className="action-btns">
                <Button 
                  onClick={() => this.addNewRow()}
                  type="primary" icon="plus">Thêm mới</Button>
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
    );
  }
}

export default EditableTable