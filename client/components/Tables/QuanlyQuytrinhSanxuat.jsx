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

let ganttData = {
	"data":[
		{"id":11, "text":"Project #1", "start_date":"28-03-2018", "duration":"11", "progress": 0.6, "open": true},
		{"id":1, "text":"Project #2", "start_date":"01-04-2018", "duration":"18", "progress": 0.4, "open": true},

		{"id":2, "text":"Task #1", "start_date":"02-04-2018", "duration":"8", "parent":"1", "progress":0.5, "open": true},
		{"id":3, "text":"Task #2", "start_date":"11-04-2018", "duration":"8", "parent":"1", "progress": 0.6, "open": true},
		{"id":4, "text":"Task #3", "start_date":"13-04-2018", "duration":"6", "parent":"1", "progress": 0.5, "open": true},
		{"id":5, "text":"Task #1.1", "start_date":"02-04-2018", "duration":"7", "parent":"2", "progress": 0.6, "open": true},
		{"id":6, "text":"Task #1.2", "start_date":"03-04-2018", "duration":"7", "parent":"2", "progress": 0.6, "open": true},
		{"id":7, "text":"Task #2.1", "start_date":"11-04-2018", "duration":"8", "parent":"3", "progress": 0.6, "open": true},
		{"id":8, "text":"Task #3.1", "start_date":"14-04-2018", "duration":"5", "parent":"4", "progress": 0.5, "open": true},
		{"id":9, "text":"Task #3.2", "start_date":"14-04-2018", "duration":"4", "parent":"4", "progress": 0.5, "open": true},
		{"id":10, "text":"Task #3.3", "start_date":"14-04-2018", "duration":"3", "parent":"4", "progress": 0.5, "open": true},
		
		{"id":12, "text":"Task #1", "start_date":"03-04-2018", "duration":"5", "parent":"11", "progress": 1, "open": true},
		{"id":13, "text":"Task #2", "start_date":"02-04-2018", "duration":"7", "parent":"11", "progress": 0.5, "open": true},
		{"id":14, "text":"Task #3", "start_date":"02-04-2018", "duration":"6", "parent":"11", "progress": 0.8, "open": true},
		{"id":15, "text":"Task #4", "start_date":"02-04-2018", "duration":"5", "parent":"11", "progress": 0.2, "open": true},
		{"id":16, "text":"Task #5", "start_date":"02-04-2018", "duration":"7", "parent":"11", "progress": 0, "open": true},

		{"id":17, "text":"Task #2.1", "start_date":"03-04-2018", "duration":"2", "parent":"13", "progress": 1, "open": true},
		{"id":18, "text":"Task #2.2", "start_date":"06-04-2018", "duration":"3", "parent":"13", "progress": 0.8, "open": true},
		{"id":19, "text":"Task #2.3", "start_date":"10-04-2018", "duration":"4", "parent":"13", "progress": 0.2, "open": true},
		{"id":20, "text":"Task #2.4", "start_date":"10-04-2018", "duration":"4", "parent":"13", "progress": 0, "open": true},
		{"id":21, "text":"Task #4.1", "start_date":"03-04-2018", "duration":"4", "parent":"15", "progress": 0.5, "open": true},
		{"id":22, "text":"Task #4.2", "start_date":"03-04-2018", "duration":"4", "parent":"15", "progress": 0.1, "open": true},
		{"id":23, "text":"Task #4.3", "start_date":"03-04-2018", "duration":"5", "parent":"15", "progress": 0, "open": true}
	],
	"links":[
		{"id":"1","source":"1","target":"2","type":"1"},
		{"id":"2","source":"2","target":"3","type":"0"},
		{"id":"3","source":"3","target":"4","type":"0"},
		{"id":"4","source":"2","target":"5","type":"2"},
		{"id":"5","source":"2","target":"6","type":"2"},
		{"id":"6","source":"3","target":"7","type":"2"},
		{"id":"7","source":"4","target":"8","type":"2"},
		{"id":"8","source":"4","target":"9","type":"2"},
		{"id":"9","source":"4","target":"10","type":"2"},
		{"id":"10","source":"11","target":"12","type":"1"},
		{"id":"11","source":"11","target":"13","type":"1"},
		{"id":"12","source":"11","target":"14","type":"1"},
		{"id":"13","source":"11","target":"15","type":"1"},
		{"id":"14","source":"11","target":"16","type":"1"},
		{"id":"15","source":"13","target":"17","type":"1"},
		{"id":"16","source":"17","target":"18","type":"0"},
		{"id":"17","source":"18","target":"19","type":"0"},
		{"id":"18","source":"19","target":"20","type":"0"},
		{"id":"19","source":"15","target":"21","type":"2"},
		{"id":"20","source":"15","target":"22","type":"2"},
		{"id":"21","source":"15","target":"23","type":"2"}
	]
};

const trangThaiPhieuObj = convertArrayObjectToObject(trangThaiPhieu);

const tableConfig = {
  headTitle: 'Quản lý quy trình sản xuất',
  addNewTitle: 'Thêm quy trình mới'
};

const fetchConfig = {
  fetch: 'quytrinhsx/fetch',
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
    let {mainState} = this.props;
    let {quyTrinhSx} = mainState;
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