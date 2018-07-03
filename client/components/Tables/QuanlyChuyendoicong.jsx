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
      khachhangList: {}
    };
    this.columns = [
      {
        title: 'Mã nhân viên',
        dataIndex: 'ma_ns',
        //width: '15%',
        editable: true,
        required: true,
        render: (text, record) => {
          let label = text, ma_ns = '';
          if(this.state.khachhangList && this.state.khachhangList[text]) {
            ma_ns = this.state.khachhangList[text]['ma_ns'];
          }
          return <span>{ma_ns}</span>
        }
      },
      {
        title: 'Tên nhân viên',
        dataIndex: 'ma_cv',
        //width: '40%',
        editable: true,
        required: true,
        render: (text, record) => {
          let label = text, ma_ns = '';
          if(this.state.khachhangList && this.state.khachhangList[text]) {
            label = this.state.khachhangList[text]['name'];
            ma_ns = this.state.khachhangList[text]['ma_ns'];
          }
          return <span>{label}</span>
        }
      },
      {
        title: 'Tổng hệ số 1.0',
        dataIndex: 'heso1',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Tổng hệ số 1.2',
        dataIndex: 'heso12',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Tổng hệ số 1.3',
        dataIndex: 'heso13',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Tổng công',
        dataIndex: 'congquydoi',
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
          // this.props.dispatch(updateStateData({
          //   sanluong: json.data
          // }));
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
  }
  
  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
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
        /> }
      </React.Fragment>
    );
  }
}

export default EditableTable