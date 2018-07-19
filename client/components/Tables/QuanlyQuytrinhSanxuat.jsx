import React from 'react'
import { 
  Table, Input, Select, 
  Popconfirm, Form, Row, 
  Col, Button, message, Modal
} from 'antd';
import {getTokenHeader, convertArrayObjectToObject, trangThaiPhieu} from 'ISD_API'
import {updateStateData} from 'actions'
import QTSXForm from './QuanlyQuytrinhSanxuat/QTSXForm'
import Gantt from './QuanlyQuytrinhSanxuat/Gantt'

const tableConfig = {
  headTitle: 'Quản lý quy trình sản xuất',
  addNewTitle: 'Thêm quy trình mới'
};

const fetchConfig = {
  fetch: 'quytrinhsx/fetch',
  update: 'quytrinhsx/update',
  delete: 'quytrinhsx/delete/'
}

class QuanlyQuytrinhSanxuat extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      data: [], 
      addNewItem: false,
      currentZoom: 'Days'
    };
    this.back = this.back.bind(this);
    this.saveData = this.saveData.bind(this);
    this.columns = [
      {
        title: 'Tên quy trình',
        dataIndex: 'name',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Mô tả',
        dataIndex: 'note',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Ngày Tạo',
        dataIndex: 'create_on',
        //width: '40%',
        editable: false,
      },
      {
        title: 'Người Tạo',
        dataIndex: 'username',
        render: (text, record) => record.nick_name || text
      },
      {
        title: 'Actions',
        dataIndex: 'operation',
        render: (text, record) => {
          
          return (
            <div style={{minWidth: 100}}>
              <a href="javascript:;" onClick={() => this.view(record)}>Xem chi tiết</a> 
              {" | "}
              <Popconfirm
                title="Bạn thật sự muốn xoá?"
                okType="danger"
                onConfirm={() => this.delete(record)}
              >
                <a href="javascript:;">Xoá</a>  
              </Popconfirm>
            </div>
          );
        },
      },
    ];
  }
  getDefaultFields() {
    return {
      id: '',
      name: '',
      note: '',
    }
  }
  addNewRow() {
    this.props.dispatch(updateStateData({
      quyTrinhSx: {
        ...this.props.mainState.quyTrinhSx,
        openModal: true
      },
    }));
  }
  view(record) {
    let {quyTrinhSx} = this.props.mainState;
    this.props.dispatch(updateStateData({
      quyTrinhSx: {
        ...this.props.mainState.quyTrinhSx,
        edit: record
      },
      //Reset gantt data
      ganttData: {
        "data":[],
        "links":[]
      }
    }));
  }
  saveData(values) {
    fetch(ISD_BASE_URL + fetchConfig.update, {
      method: 'POST',
      headers: getTokenHeader(),
      body: JSON.stringify(values)
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
        message.success(json.message);
        if(json.newRecord) {
          this.props.dispatch(updateStateData({
            quyTrinhSx: {
              ...this.props.mainState.quyTrinhSx,
              edit: json.newRecord,
              openModal: false
            },
            ganttData: {
              links: [],
              data: []
            }
          }));
          this.fetchData();
        } else {
          this.back();
        }
      }
    }).catch((ex) => {
      console.log('parsing failed', ex)
      message.error('Có lỗi xảy ra trong quá trình lưu hoặc chỉnh sửa quy trình!');
    });
  }
  back() {
    this.props.dispatch(updateStateData({
      quyTrinhSx: {
        ...this.props.mainState.quyTrinhSx,
        edit: {}
      }
    }));
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
            phieunhap: {
              refresh: false
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
          message.error('Có lỗi xảy ra khi xoá quy trình sản xuất!', 3);
        } else {
          let newData = this.state.data.filter((item) => item.id != json.data);
          this.setState({data: newData});
          message.success(json.message);
        }
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra khi xoá quy trình sản xuất!', 3);
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
    let {refresh} = nextProps.mainState.phieunhap;
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
  logTaskUpdate(id, mode, task) {
    let text = task && task.text ? ` (${task.text})`: '';
    let msg = `Task ${mode}: ${id} ${text}`;
    message.success(msg);
  }

  logLinkUpdate(id, mode, link) {
    let msg = `Link ${mode}: ${id}`;
    if (link) {
      msg += ` ( source: ${link.source}, target: ${link.target} )`;
    }
    message.success(msg);
  }

  handleZoomChange(zoom) {
    this.setState({
      currentZoom: zoom
    });
  }  
  render() {
    let {mainState, dispatch} = this.props;
    let {quyTrinhSx} = mainState;
    const columns = this.columns;

    return (
      <React.Fragment>
        <Modal
          //width={"100%"}
          title="Form quy trình sản xuất"
          visible={quyTrinhSx.openModal}
          onCancel={()=> {
            dispatch(updateStateData({
              quyTrinhSx: {
                ...mainState.quyTrinhSx,
                openModal: false
              }
            }));
          }}
          footer={null}
          >
          <QTSXForm
            saveData={this.saveData}
            dispatch={this.props.dispatch}
            mainState={this.props.mainState}
          />
        </Modal>
        {(!quyTrinhSx.edit || !quyTrinhSx.edit.id) ? 
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
              bordered
              dataSource={this.state.data}
              columns={columns}
              rowClassName="editable-row"
            />
          </React.Fragment>
          : 
            <div className="edit-quy-trinh">
              <div className="table-operations">
                <Row>
                  <Col span={12}>
                    <Input onChange={(e) => {
                      dispatch(updateStateData({
                        quyTrinhSx: {
                          ...mainState.quyTrinhSx,
                          edit: {
                            ...mainState.quyTrinhSx.edit,
                            name: e.target.value
                          }
                        }
                      }))
                    }} value={quyTrinhSx.edit.name} />
                  </Col>
                  <Col span={12}>
                    <div className="action-btns">
                    <Button.Group>
                      <Button 
                        onClick={this.back}
                        icon="left">Quay lại</Button>
                      <Button 
                        onClick={() => {
                          this.saveData(mainState.quyTrinhSx.edit)
                        }}
                        type="primary" icon="save">Lưu thay dổi</Button>
                      </Button.Group>
                    </div>
                  </Col>
                </Row>
              </div>
              <div className="wrap-gantt-chart">
                <Gantt
                  mainState={this.props.mainState}
                  dispatch={this.props.dispatch}
                />
              </div>
            </div>
          }
        
      </React.Fragment>
    );
  }
}

export default QuanlyQuytrinhSanxuat