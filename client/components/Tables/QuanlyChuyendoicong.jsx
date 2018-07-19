import React from 'react'
import moment from 'moment'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row,
  Col, Button, message, DatePicker, TimePicker
} from 'antd';
const { MonthPicker } = DatePicker;
import {getTokenHeader, convertArrayObjectToObject} from 'ISD_API'
import {updateStateData} from 'actions'
import TimkiemCDC from './QuanlySanluong/TimkiemCDC'

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
      total: [],
      editingKey: '',
      newitem: 0,
      jobsList: {}
    };
    this.columns = [
      {
        title: 'Mã nhân viên',
        dataIndex: 'ma_ns',
        //width: '15%',
        editable: true,
        required: true,
      },
      {
        title: 'Tên nhân viên',
        dataIndex: 'name',
        //width: '40%',
        editable: true,
        required: true,
      },
      {
        title: 'Sum 1.0',
        dataIndex: 'heso1',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Sum 1.2',
        dataIndex: 'heso12',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Sum 1.3',
        dataIndex: 'heso13',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Sum OT 1.0',
        dataIndex: 'heso21',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Sum OT 1.2',
        dataIndex: 'heso22',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Sum OT 1.3',
        dataIndex: 'heso23',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Tổng công',
        dataIndex: 'tong_cong',
        //width: '40%',
        editable: true,
      },
      {
        title: 'Công quy đổi',
        dataIndex: 'songay',
        //width: '20%',
        editable: true,
      }
    ];
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
      ot: ""
    };
  }
  isEditing = (record) => {
    return record.key === this.state.editingKey;
  };
  fetchData() {
    fetch(ISD_BASE_URL + 'cdc/fetchCdc', {
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
  fetchNhanvien() {
    fetch(ISD_BASE_URL + 'qlns/fetchNs', {
      headers: getTokenHeader()
    })
    .then((resopnse) => resopnse.json())
    .then((json) => {
      if(json.data) {
        if(json.data) {
          this.props.dispatch(updateStateData({
            nhansu: json.data
          }));
          this.setState({
            nhansuList: convertArrayObjectToObject(json.data, 'ma_ns')
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
  fetchTotal() {
    fetch(ISD_BASE_URL + 'cdc/fetchTotal', {
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
          //get total
          let total = json.data[0];
          this.setState({total});
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu sản lượng!', 3);
      console.log(error);
    }); 
  }
  componentDidMount() {
    this.fetchData();
    this.fetchTotal();
    this.fetchNhanvien();
  }
  
  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    let data = this.props.mainState.data || [];
    let nhansu = this.props.mainState.nhansu || [];
    let monthFormat = 'MM/YYYY';
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
    const total = this.columns.map((col) => {
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
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">Chuyển đổi công hàng tháng</h2>
            </Col>
          </Row>
        </div>
        {<Table
          components={components}
          bordered
          dataSource={this.state.data}
          columns={columns}
          rowClassName="editable-row"
          title={() => {
            return (
              <TimkiemCDC 
                //Cap nhat du lieu sau khi tim kiem
                onResult={(data) => {
                  this.setState({data});
                }}
                loading={(loading) => {
                this.setState({loading: loading});
              }}/>
            );
          }}
          // footer={() => 
          //   <Row>
          //     <Col span={3}> Tổng công </Col>
          //     <Col span={3}> HS 1: {this.state.total.heso1}</Col>
          //     <Col span={3}> HS 1.2: {this.state.total.heso12}</Col>
          //     <Col span={3}> HS 1.3: {this.state.total.heso13}</Col>
          //     <Col span={3}> HSOT 1: {this.state.total.heso1}</Col>
          //     <Col span={3}> HSOT 1.2: {this.state.total.heso1}</Col>
          //     <Col span={3}> HSOT 1.3: {this.state.total.heso1}</Col>
          //     <Col span={3}> Tổng: {this.state.total.tong_cong}</Col>
          //   </Row>
            
          // }
        /> }
      </React.Fragment>
    );
  }
}

export default EditableTable