import React from 'react'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject} from 'ISD_API'
import {updateStateData} from 'actions'
import FormPhieunhap from './QuanlyPhieunhap/FormPhieunhap'

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const tableConfig = {
  headTitle: 'Quản lý phiếu nhập',
  addNewTitle: 'Thêm phiếu nhập mới'
};

const fetchConfig = {
  fetch: 'product/fetch',
  update: 'product/update',
  delete: 'product/delete/'
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
      editingKey: '',
      addNewItem: false,
    };
    this.columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        width: '10%',
        editable: true,
        required: true,
      },
      {
        title: 'Mã phiếu',
        dataIndex: 'ma_phieu',
        //width: '15%',
        editable: true,
        required: true
      },
      {
        title: 'Mô tả',
        dataIndex: 'note',
        //width: '40%',
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
    this.setState({
      addNewItem: true
    })
  }
  getDefaultFields() {
    return {
      product_id: "",
      category_id: "",
      name: "",
      unit: "",
      min: "0",
      max: "0",
    };
  }
  isEditing = (record) => {
    return record.key === this.state.editingKey;
  };
  edit(key) {
    this.setState({ editingKey: key });
  }
  save() {
    
  }
  cancel = () => {
    this.setState({ editingKey: '' });
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
  render() {
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
        {this.state.addNewItem ? 
          <FormPhieunhap
            dispatch={this.props.dispatch}
            onCancel={() => {
              this.setState({addNewItem: false})
            }}
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