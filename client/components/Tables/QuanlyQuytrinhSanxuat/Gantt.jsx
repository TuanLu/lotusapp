/*global gantt*/

/**
 * Vi gantt la global object, nen toan bo app chi dung 1 doi tuong gantt.
 * Thay doi cac bieu do bang cach reset lai event, reset lai data
 */
import React, { Component } from 'react';
import 'dhtmlx-gantt';
//import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_tooltip.js';
//import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_undo.js';
import './locale_vn.js';
//import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import './Theme.css';
//import {connect} from 'react-redux'
import {getTokenHeader} from 'ISD_API'
import {updateStateData} from 'actions'
import moment from 'moment'
import { 
  message,
  Spin
} from 'antd';

class Gantt extends Component {
  constructor(props) {
    super(props);
    this.saveData = this.saveData.bind(this);
    this.getQuyTrinhId = this.getQuyTrinhId.bind(this);
    this.getMaSx = this.getMaSx.bind(this);
    this.clearAllEvents = this.clearAllEvents.bind(this);
    this.expandAllTask = this.expandAllTask.bind(this);
    this.addControlToLightBox = this.addControlToLightBox.bind(this);
    this.fetchUsers = this.fetchUsers.bind(this);
    this.state = {
      loading: false,
      resetEvents: false,
    }
  }
  setZoom(value){
    switch (value){
      case 'Hours':
        gantt.config.scale_unit = 'day';
        gantt.config.date_scale = '%d %M';

        gantt.config.scale_height = 60;
        gantt.config.min_column_width = 30;
        gantt.config.subscales = [
          {unit:'hour', step:1, date:'%H'}
        ];
        break;
      case 'Days':
        gantt.config.min_column_width = 70;
        gantt.config.scale_unit = "week";
        gantt.config.date_scale = "#%W";
        gantt.config.subscales = [
          {unit: "day", step: 1, date: "%d %M"}
        ];
        gantt.config.scale_height = 60;
        break;
      case 'Months':
        gantt.config.min_column_width = 70;
        gantt.config.scale_unit = "month";
        gantt.config.date_scale = "%F";
        gantt.config.scale_height = 60;
        gantt.config.subscales = [
          {unit:"week", step:1, date:"#%W"}
        ];
        break;
      default:
        break;
    }
  }
  expandAllTask(ganttData) {
    if(ganttData) {
      let ganttTasks = [];
      if(ganttData.data) {
        ganttTasks = ganttData.data.map((task) => {
          return {
            ...task,
            open: true,//Expand all task
          }
        });
      } 
      let expandAllGanttData = {
        links: ganttData.links,
        data: ganttTasks
      }
      return expandAllGanttData;
    }
  }
  updateGanttDataToState(data) {
    let ganttData = this.expandAllTask(data) || data;
    this.props.dispatch(updateStateData({
      ganttData: ganttData,
    }));
  }
  fetchTasks() {
    this.setState({loading: true});
    let fetchUrl;
    switch (this.props.type) {
      case 'allPlan':
        fetchUrl = ISD_BASE_URL + 'gantt/allPlan';
        break;
      case 'theo_lenh_sx':
        let maSX = this.getMaSx();
        fetchUrl = ISD_BASE_URL + 'gantt/fetchTasksByMaSx/' + maSX;
        //Load tu quy trinh mau
        // console.log(this.props.mainState.sx);
        // if(this.props.mainState.sx && this.props.mainState.sx.quyTrinhMauId) {
        //   fetchUrl += `/${this.props.mainState.sx.quyTrinhMauId}`;
        // }
        break;
      default:
        let quyTrinhId = this.getQuyTrinhId();
        fetchUrl = ISD_BASE_URL + 'gantt/fetchTasks/' + quyTrinhId;
        break;
    }
    fetch(fetchUrl, {
      headers: getTokenHeader()
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.status == 'error') {
        this.renderGantt();
        message.warning(json.message, 3);
      } else {
        if(json.data) {
          this.updateGanttDataToState(json.data);
        }
      }
      this.setState({
        loading: false, 
      });
      this.renderGantt();
    })
    .catch((error) => {
      this.renderGantt();
      message.error('Có lỗi khi tải dữ liệu quy trình sản xuất!', 3);
      console.log(error);
      this.setState({loading: false});
    }); 
  }
  fetchUsers() {
    this.setState({loading: true});
    fetch(ISD_BASE_URL + 'gantt/users', {
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
            worker_and_users: {
              workers: json.data.workers,
              check_users: json.data.check_users
           }
         }));
         this.addControlToLightBox();
       }
      }
      this.setState({
        loading: false, 
      });
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu nhân sự và người phê duyệt!', 3);
      console.log(error);
      this.setState({loading: false});
    }); 
  }
  renderGantt(data) {
    let {mainState} = this.props;
    let {ganttData} = mainState;
    ganttData = ganttData || {};
    gantt.clearAll();
    gantt.parse(ganttData);   
    gantt.render();
  }
  //Switch tu quy trinh nay sang quy trinh khac, phai cap nhat lai bien gantt
  static getDerivedStateFromProps(nextProps, prevState) {
    //Switch theo quy trinh ID
    if(nextProps.mainState.quyTrinhSx.edit.id && nextProps.mainState.quyTrinhSx.edit.id !== prevState.quyTrinhId) {
      //console.log('thay doi quy trinh, reset lai event di nao');
      return {
        quyTrinhId: nextProps.mainState.quyTrinhSx.edit.id,
        resetEvents: true
      }
    }
    //Cap nhat khi thay doi ma sx
    if(nextProps.mainState.sx.ma_sx && nextProps.mainState.sx.ma_sx !== prevState.ma_sx) {
      //console.log('thay doi ma san xuat kia, reset lai event di nao');
      return {
        ma_sx: nextProps.mainState.sx.ma_sx,
        resetEvents: true
      }
    }
    //Cap nhat khi thay doi quy trinh mau, hoac khi co yeu cau thay doi
    if(nextProps.mainState.refreshGantt) {
      return {
        resetEvents: true
      }
    }
    return null;
  }
  componentDidUpdate() {
    //Cap nhat lai gantt
    if(this.state.resetEvents) {
      this.clearAllEvents();
      this.initGanttEvents();
      this.setState({resetEvents: false});
      this.renderGantt();
    }
  }
  saveData(task) {
    fetch(ISD_BASE_URL + 'gantt/update', {
      method: 'POST',
      headers: getTokenHeader(),
      body: JSON.stringify(task)
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
        if(json.data) {
          this.updateGanttDataToState(json.data);
          message.success(json.message);
        }
      }
      this.renderGantt();
    }).catch((ex) => {
      this.fetchTasks();
      console.log('parsing failed', ex)
      message.error('Có lỗi xảy ra trong quá trình lưu hoặc chỉnh sửa quy trình!');
    });
  }
  saveLink(link) {
    fetch(ISD_BASE_URL + 'gantt/updateLink', {
      method: 'POST',
      headers: getTokenHeader(),
      body: JSON.stringify(link)
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
        if(json.data) {
          this.updateGanttDataToState(json.data);
          message.success(json.message);
        }
      }
      this.renderGantt();
    }).catch((ex) => {
      this.fetchTasks();
      console.log('parsing failed', ex)
      message.error('Có lỗi xảy ra trong quá trình update link!');
    });
  }
  getQuyTrinhId() {
    return this.props.mainState.quyTrinhSx.edit ? this.props.mainState.quyTrinhSx.edit.id : '';
  }
  getMaSx() {
    return this.props.mainState.sx.ma_sx ? this.props.mainState.sx.ma_sx : '';
  }
  updateTask(id, mode, task) {
    let taskData = {
      text: task.text,
      start_date: moment(task.start_date).format('YYYY-MM-DD HH:mm:ss'),
      duration: task.duration,
      parent: task.parent,
      progress: task.progress || 0,
      user: task.user,
      check_user: task.check_user
    };
    //Luu theo quy trinh hoac luu theo lenh san xuat
    if(this.props.type == "theo_lenh_sx") {
      let maSX = this.getMaSx();
      taskData.ma_sx = maSX;
    } else {
      let quyTrinhId = this.getQuyTrinhId();
      taskData.quy_trinh_id = quyTrinhId;
    }
    if(mode == "updated") {
      taskData.id = id;
    }
    this.saveData(taskData);
  }
  updateLink(id, mode, link) {
    let linkData = {
      source: link.source,
      target: link.target,
      type: link.type
    }
    if(this.props.type == "theo_lenh_sx") {
      let maSX = this.getMaSx();
      linkData.ma_sx = maSX;
    } else {
      let quyTrinhId = this.getQuyTrinhId();
      linkData.quy_trinh_id = quyTrinhId;
    }
    this.saveLink(linkData);
  }
  deleteTask = (id) => {
    if(id) {
      fetch(ISD_BASE_URL + `gantt/delete/${id}`, {
        headers: getTokenHeader()
      })
      .then((response) => response.json())
      .then((json) => {
        if(json.status == 'error') {
          message.error('Có lỗi xảy ra khi xoá quy trình!', 3);
        } else {
          message.success(json.message);
        }
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra khi xoá sản phẩm!', 3);
        console.log(error);
      });
    }
  }
  deleteLink = (id) => {
    if(id) {
      fetch(ISD_BASE_URL + `gantt/deleteLink/${id}`, {
        headers: getTokenHeader()
      })
      .then((response) => response.json())
      .then((json) => {
        if(json.status == 'error') {
          message.error('Có lỗi xảy ra khi xoá quy trình!', 3);
        } else {
          message.success(json.message);
        }
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra khi xoá sản phẩm!', 3);
        console.log(error);
      });
    }
  }
  clearAllEvents() {
    //Reset lai toan bo events cua gantt, de khong su dung du lieu cu
    let {mainState} = this.props;
    if(mainState && mainState.ganttEvents) {
      mainState.ganttEvents.forEach((event) => {
        gantt.detachEvent(event);
      });
      gantt.ganttEventsInitialized = false;
    }
  }

  initGanttEvents() {
    if(gantt.ganttEventsInitialized){
      return;
    }
    gantt.ganttEventsInitialized = true;
    //Cho tat ca cac su kien vao mainState de co the reset ve sau
    let eventsList = [];
    eventsList.push(
      gantt.attachEvent('onAfterTaskAdd', (id, task) => {
        this.updateTask(id, 'inserted', task);
      })
    );
    eventsList.push(
      gantt.attachEvent('onAfterTaskUpdate', (id, task) => {
        this.updateTask(id, 'updated', task);
      })
    );
    eventsList.push(
      gantt.attachEvent('onAfterTaskDelete', (id) => {
        this.deleteTask(id);
      })
    );
    eventsList.push(
      gantt.attachEvent('onAfterLinkAdd', (id, link) => {
        this.updateLink(id, 'inserted', link);
      })
    );
    eventsList.push(
      gantt.attachEvent('onAfterLinkDelete', (id, link) => {
        this.deleteLink(id);
      })
    );
    eventsList.push(
      gantt.attachEvent("onLightboxSave", function (id, item) {
        if (!item.text) {
          gantt.message({type: "error", text: "Hãy nhập mô tả công việc!"});
          return false;
        }
        if (!item.user) {
          gantt.message({type: "error", text: "Hãy chọn người thực hiện!"});
          return false;
        }
        if (!item.check_user) {
          gantt.message({type: "error", text: "Hãy chọn người phê duyệt!"});
          return false;
        }
        return true;
      })
    );
    this.props.dispatch(updateStateData({
      ganttEvents: eventsList,
      refreshGantt: false
    }));
  }
  componentDidMount() {
    let {mainState} = this.props;
    let {ganttData} = mainState;
    gantt.config.xml_date = "%Y-%m-%d %H:%i:%s";
    gantt.config.date_grid = "%d-%m-%Y";
    gantt.config.grid_width = 450;
    //Detect Project Level - Level 0
    gantt.templates.task_class = function (st, end, item) {
      return item.$level == 0 ? "gantt_project" : ""
    };
    gantt.templates.rightside_text = function (start, end, task) {
      return "<span style='text-align:left;'>" + Math.round(task.progress * 100) + "% </span>";
    };
    gantt.config.columns = [
      {name: "text", hide: true, tree: true},
      {name: "start_date", hide: true, align: "center"},
      {name: "duration", hide: false, align: "center"},
      {name: "add", hide: false, align: "center"}
    ];
    //gantt.config.show_grid = true;
    gantt.config.show_links = true;
    //gantt.config.show_progress = true;
    gantt.config.readonly = false;
    gantt.config.drag_move = true;
    if(this.props.type == "allPlan") {
      gantt.config.drag_move = false;
      gantt.config.readonly = true;
      //gantt.config.show_grid = false;
      gantt.config.show_links = false;
      //gantt.config.show_progress = false;
      gantt.config.columns = [
        {name: "text", hide: true, tree: true},
        {name: "start_date", hide: true, align: "center"},
        {name: "duration", hide: true, align: "center"},
        //{name: "add", hide: true}
      ];
    }
    //gantt.config.start_date = new Date();
    gantt.config.start_date = gantt.date.day_start(new Date());
    // gantt.templates.progress_text = function (start, end, task) {
    //   return "<span style='text-align:left;'>" + Math.round(task.progress * 100) + "% </span>";
    // };
    //gantt.config.task_date = "%d-%m-%Y";
    //this.initGanttEvents();
    gantt.config.order_branch = true;
    gantt.config.order_branch_free = true;
    gantt.init(this.ganttContainer);
    this.addControlToLightBox();
    gantt.parse(ganttData);
    this.fetchTasks();
  }
  addControlToLightBox() {
    let {worker_and_users} = this.props.mainState;
    if(worker_and_users) {
      let workers = worker_and_users.workers || [];
      let check_users = worker_and_users.check_users || [];

      let workerOptions = [{key: "", label: "Người thực hiện"}];
      workerOptions = workerOptions.concat(workers.map((worker) => {
        return {
          key: worker.ma_ns,
          label: worker.ma_ns + '-' + worker.name
        }
      }));
      let checkUserOptions = [{key: "", label: "Người phê duyệt"}];
      checkUserOptions = checkUserOptions.concat(check_users.map((user) => {
        return {
          key: user.id,
          label: user.name || user.username
        }
      }));
      gantt.config.lightbox.sections = [
        {name: "description", height: 38, map_to: "text", type: "textarea", focus: true},
        {name: "user", height: 25, map_to: "user", type: "select", options: workerOptions},
        {name: "check_user", height: 25, map_to: "check_user", type: "select", options: checkUserOptions},
        {
          name: "progress", height: 25, map_to: "progress", type: "select", options: [
            {key: 0, label: "Chưa bắt đầu"},
            {key: "0.1", label: "10%"},
            {key: "0.2", label: "20%"},
            {key: "0.3", label: "30%"},
            {key: "0.4", label: "40%"},
            {key: "0.5", label: "50%"},
            {key: "0.6", label: "60%"},
            {key: "0.7", label: "70%"},
            {key: "0.8", label: "80%"},
            {key: "0.9", label: "90%"},
            {key: "1", label: "Hoàn thành"}
          ]
        },
        {name: "time", type: "duration", map_to: "auto"},
      ];
    
      gantt.locale.labels["section_user"] = "Người thực hiện";
      gantt.locale.labels["section_check_user"] = "Người phê duyệt";
      gantt.locale.labels["section_progress"] = "Số % hoàn thành";
    } else {
      this.fetchUsers();
    }
  }

  render() {
    //this.setZoom(this.props.zoom);
    return (
     <React.Fragment>
        <div className="loading" style={{
          display: this.state.loading ? 'block' : 'none'
        }}>
          <Spin size="large" />
        </div>
        <div
          ref={(input) => { this.ganttContainer = input }}
          style={{width: '100%', height: '100%'}}
      ></div>
     </React.Fragment>
    );
  }
}

export default Gantt

// export default connect((state) => {
//   return {
//     mainState: state.main.present,
//   }
// })(Gantt)