import React from 'react'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message
} from 'antd';
import { getTokenHeader } from 'ISD_API';

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
      editingKey: '' 
    };
    this.columns = [
      {
        title: 'Mã Kho',
        dataIndex: 'ma_kho',
        width: '10%',
        editable: true,
        required: true,
      },
      {
        title: 'Tên',
        dataIndex: 'name',
        //width: '15%',
        editable: true,
        required: true
      },
      {
        title: 'Thông tin',
        dataIndex: 'description',
        //width: '40%',
        editable: true,
        required: true
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
    let rowItem = this.getDefaultFields();
    rowItem = {
      ...rowItem,
      key: this.state.data.length + 1
    };
    this.setState({
      data: [rowItem, ...this.state.data],
      editingKey: rowItem.key
    })
  }
  getDefaultFields() {
    return {
      ma_kho: "",
      name: "",
      description: ""
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
        };
        fetch(ISD_BASE_URL + 'qlkho/updateKho', {
          method: 'POST',
          headers: getTokenHeader(),
          body: JSON.stringify(newItemData)
        })
        .then((response) => {
          return response.json()
        }).then((json) => {
          if(json.status == 'error') {
            message.error(json.message, 3);
          } else {
            //udate table state
            newData.splice(index, 1, {
              ...newItemData,
              ...json.data
            });
            this.setState({ data: newData, editingKey: '' });
            message.success(json.message);
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
  cancel = () => {
    this.setState({ editingKey: '' });
  }
  delete = (record) => {
    if(record.id) {
      fetch(ISD_BASE_URL + 'qlkho/deleteKho/' + record.id, {
        headers: getTokenHeader()
      })
      .then((response) => response.json())
      .then((json) => {
        if(json.status == 'error') {
          message.error('Có lỗi xảy ra khi xoá dữ liệu kho!', 3);
        } else {
          let newData = this.state.data.filter((item) => item.id != json.data);
          this.setState({data: newData});
          message.success(json.message);
        }
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra khi xoá dữ liệu kho!', 3);
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
    fetch(ISD_BASE_URL + 'qlkho/fetchKho', {
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
      message.error('Có lỗi khi tải dữ liệu dữ liệu kho!', 3);
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

    /**
      title?: React.ReactNode;
      key?: string;
      dataIndex?: string;
      render?: (text: any, record: T, index: number) => React.ReactNode;
      filters?: { text: string; value: string }[];
      onFilter?: (value: any, record: T) => boolean;
      filterMultiple?: boolean;
      filterDropdown?: React.ReactNode;
      sorter?: boolean | ((a: any, b: any) => number);
      colSpan?: number;
      width?: string | number;
      className?: string;
      fixed?: boolean | ('left' | 'right');
      filteredValue?: any[];
      sortOrder?: boolean | ('ascend' | 'descend');
    */
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
          required: col.required
        }),
      };
    });

    return (
      <React.Fragment>
        <div className="table-operations">
          <Row>
            <Col span={12}>
              <h2 className="head-title">Quản lý kho</h2>
            </Col>
            <Col span={12}>
              <div className="action-btns">
                <Button 
                  onClick={() => this.addNewRow()}
                  type="primary" icon="plus">Thêm kho mới</Button>
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