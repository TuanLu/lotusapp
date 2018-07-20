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
import Toolbar from './QuanlyQuytrinhSanxuat/Toolbar'

const trangThaiPhieuObj = convertArrayObjectToObject(trangThaiPhieu);

const tableConfig = {
  headTitle: 'Quản lý quy trình sản xuất',
  addNewTitle: 'Thêm quy trình mới'
};

const fetchConfig = {
  fetch: 'quytrinhsx/fetch',
  delete: 'quytrinhsx/delete/',
  fetchTasks: 'gantt/fetchTasks'
}

class QuanlyQuytrinhSanxuat extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      data: [], 
      addNewItem: false,
      currentZoom: 'Days'
    };
    this.columns = [
      {
        title: 'Tên quy trình',
        dataIndex: 'nguoi_giao_dich',
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
        render: (text, record) => record.name || text
      },
      {
        title: 'Tình trạng',
        dataIndex: 'tinh_trang',
        //width: '40%',
        editable: false,
        render: (text, record) => {
          return trangThaiPhieuObj[text]['text'] || text;
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
                  {(!this.isQA() && !this.isQC()) ? 
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
                    : null} 
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
  view(phieu) {
    let {phieunhap, phieuAction} = this.props.mainState;
    if(phieu && phieu.ma_phieu && phieu.id) {
      this.props.dispatch(updateStateData({
        phieunhap: {
          ...phieunhap,
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
  fetchTasks() {
    fetch(ISD_BASE_URL + fetchConfig.fetchTasks, {
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
          this.props.dispatch(updateStateData({
            ganttData: json.data,
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
    //this.fetchData();
    this.fetchTasks();
  }
  logTaskUpdate(id, mode, task) {
    let text = task && task.text ? ` (${task.text})`: '';
    let msg = `Task ${mode}: ${id} ${text}`;
    message.success(msg);
    console.log(mode);
    console.info(task);
    if(mode == "inserted") {
      //delete task['id'];
      let taskData = {
        text: task.text,
        start_date: task.start_date,
        duration: task.duration,
        parent: task.parent,
        progress: task.progress
      };
      fetch(ISD_BASE_URL + 'gantt/update', {
        method: 'POST',
        headers: getTokenHeader(),
        body: JSON.stringify(taskData)
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
        }
      }).catch((ex) => {
        console.log('parsing failed', ex)
        message.error('Có lỗi xảy ra trong quá trình lưu hoặc chỉnh sửa quy trình!');
      });
    }
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
    let {mainState} = this.props;
    let {quyTrinhSx, ganttData} = mainState;
    const columns = this.columns;

    return (
      <React.Fragment>
        <Modal
          //width={"100%"}
          title="Form quy trình sản xuất"
          visible={quyTrinhSx.openModal}
          footer={null}
          >
          <QTSXForm
            dispatch={this.props.dispatch}
            mainState={this.props.mainState}
          />
        </Modal>
        <div className="wrap-gantt-chart">
            <Gantt
              tasks={ganttData}
              zoom={this.state.currentZoom}
              onTaskUpdated={this.logTaskUpdate}
              onLinkUpdated={this.logLinkUpdate}
            />
          </div>
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
    );
  }
}

export default QuanlyQuytrinhSanxuat