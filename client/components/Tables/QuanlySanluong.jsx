import React from 'react'
import moment from 'moment'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row,
  Col, Button, message, DatePicker, TimePicker
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject} from 'ISD_API'
import {updateStateData} from 'actions'
import TimkiemSL from './QuanlySanluong/TimkiemSL'

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
      case 'ma_ns':
        let khachhang = this.props.khachhang || [];
        return (
          <Select 
            //style={{ width: 250 }}
            placeholder="Chọn nhân viên">
           {khachhang.map((khachhang) => {
              return <Select.Option 
              key={khachhang.id} 
              value={khachhang.id}>
                {`${khachhang.ma_ns} - ${khachhang.name}`}
              </Select.Option>
           })}
          </Select>
        );
        break;
      case 'ma_cv':
        let jobs = this.props.jobs || [];
        return (
          <Select 
            //style={{ width: 250 }}
            placeholder="Chọn công việc">
           {jobs.map((job) => {
              return <Select.Option 
              key={job.id} 
              value={job.id}>
                {`${job.ma_cv} - ${job.diengiai}  - ${job.heso}`}
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
            //style={{ width: 200 }}
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
        return <DatePicker placeholder="Chọn ngày" format="DD-MM-YYYY"/>;
      break;
      case 'timestart':
      case 'timestop':
        return <TimePicker placeholder="Chọn giờ" format="HH:mm"/>;
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
                value = moment(value, 'HH:mm')
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
      newitem: 0,
      jobsList: {},
      khachhangList: {},
      loading: false
    };
    this.columns = [
      {
        title: 'Ngày tạo',
        dataIndex: 'workday',
        width: '18%',
        editable: true,
        required: true,
        render: (text, record) => moment(text).format('DD-MM-YYYY'),
      },
      {
        title: 'Mã nhân viên',
        dataIndex: 'ma_ns',
        //width: '15%',
        editable: true,
        required: true,
        render: (text, record) => {
          let label = text, ma_ns = '';
          if(this.state.khachhangList && this.state.khachhangList[text]) {
            label = this.state.khachhangList[text]['name'];
            ma_ns = this.state.khachhangList[text]['ma_ns'];
          }
          return <span>{ma_ns} - {label}</span>
        }
      },
      {
        title: 'Mã công việc',
        dataIndex: 'ma_cv',
        //width: '40%',
        editable: true,
        required: true,
        render: (text, record) => {
          let label = text, ma_cv = '', heso = '';
          if(this.state.jobsList && this.state.jobsList[text]) {
            label = this.state.jobsList[text]['diengiai'];
            ma_cv = this.state.jobsList[text]['ma_cv'];
            heso = this.state.jobsList[text]['heso'];
          }
          return <span>{ma_cv} - {label} - {heso}</span>
        }
      },
      {
        title: 'Giờ bắt đầu',
        dataIndex: 'timestart',
        //width: '40%',
        editable: true,
        render: (text, record) => moment(text, "HH:mm").format("HH:mm")//moment(text).format('HH:mm:ss')
      },
      {
        title: 'Giờ kết thúc',
        dataIndex: 'timestop',
        //width: '40%',
        editable: true,
        render: (text, record) => moment(text, "HH:mm").format("HH:mm")
      },
      {
        title: 'Kết quả / sản lượng',
        dataIndex: 'sanluong',
        width: '20%',
        editable: true,
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
      sanluong: '',
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
          workday: row['workday'].format('DD-MM-YYYY'),
          timestart: row['timestart'].format('HH:mm'),
          timestop: row['timestop'].format('HH:mm'),
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
    this.setState({loading: true});
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
          // this.props.dispatch(updateStateData({
          //   sanluong: json.data
          // }));
        }
      }
      this.setState({loading: false});
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu sản lượng!', 3);
      console.log(error);
      this.setState({loading: false});
    }); 
  }
  fetchNhanvien() {
    fetch(ISD_BASE_URL + 'qlns/fetchNs', {
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
  fetchJobs() {
    fetch(ISD_BASE_URL + 'qljobs/fetchJob', {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            jobs: json.data
          }));
          this.setState({
            jobsList: convertArrayObjectToObject(json.data)
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
    this.fetchNhanvien();
    this.fetchJobs();
    this.fetchData();
  }
  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    let jobs = this.props.mainState.jobs;
    let khachhang = this.props.mainState.khachhang;
    let data = this.props.mainState.data || [];
    
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
          jobs,
          khachhang
        }),
      };
    });
    // Chọn ids để quick xóa hoặc edit ...
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
    };
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
        {<Table
          components={components}
          bordered
          dataSource={this.state.data}
          columns={columns}
          loading={this.state.loading}
          rowClassName="editable-row"
          pagination={{ pageSize: 20 }}
          title={() => {
            return (
              <TimkiemSL 
                onResult={(data) => {
                  this.setState({data});
                }}
                loading={(loading) => {
                this.setState({loading: loading});
              }}/>
            );
          }}
        /> }
      </React.Fragment>
    );
  }
}

export default EditableTable