import React, { Component } from 'react';
import './lib/dhtmlxgantt';
import './lib/locale_vn.js';
import './lib/dhtmlxgantt_marker.js'
import './lib/Theme.css';
import {getTokenHeader} from 'ISD_API'
import {updateStateData} from 'actions'
import moment from 'moment'
import { 
  message,
  Spin
} from 'antd';

const ganttRnd = Gantt.getGanttInstance();
//Translate to vn
ganttRnd.locale = gantt.locale;

class GanttComponent extends Component {
  constructor(props) {
    super(props);
    this.saveData = this.saveData.bind(this);
    this.getMaRnd = this.getMaRnd.bind(this);
    this.clearAllEvents = this.clearAllEvents.bind(this);
    this.expandAllTask = this.expandAllTask.bind(this);
    this.addControlToLightBox = this.addControlToLightBox.bind(this);
    this.fetchUsers = this.fetchUsers.bind(this);
    this.updateOrder = this.updateOrder.bind(this);
    this.state = {
      loading: false,
      resetEvents: false,
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
    let maRnd = this.getMaRnd();
    let fetchUrl = ISD_BASE_URL + 'gantt/fetchTasksByMaRnd/' + maRnd;
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
              check_users: json.data.check_users,
              group_users: json.data.group_users
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
  renderTodayMarker() {
    var date_to_str = ganttRnd.date.date_to_str(ganttRnd.config.task_date);
    var today = new Date();
    ganttRnd.addMarker({
      start_date: today,
      css: "today",
      text: "Hôm nay",
      title: "Hôm nay: " + date_to_str(today)
    });
  }
  renderGantt(data) {
    let {mainState} = this.props;
    let {ganttData} = mainState;
    ganttData = ganttData || {};
    ganttRnd.clearAll();
    this.renderTodayMarker();
    ganttRnd.parse(ganttData);   
    ganttRnd.render();
  }
  //Switch tu quy trinh nay sang quy trinh khac, phai cap nhat lai bien ganttRnd
  static getDerivedStateFromProps(nextProps, prevState) {
    //Cap nhat khi thay doi ma rnd
    if(nextProps.mainState.rnd.ma_rnd && nextProps.mainState.rnd.ma_rnd !== prevState.ma_rnd) {
      //console.log('thay doi ma san xuat kia, reset lai event di nao');
      return {
        ma_rnd: nextProps.mainState.rnd.ma_rnd,
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
    //Cap nhat lai ganttRnd
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
        this.updateGanttDataToState(json.data);
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
  getMaRnd() {
    return this.props.mainState.rnd.ma_rnd ? this.props.mainState.rnd.ma_rnd : '';
  }
  updateTask(id, mode, task) {
    let taskData = {
      text: task.text,
      start_date: moment(task.start_date).format('YYYY-MM-DD HH:mm:ss'),
      duration: task.duration,
      parent: task.parent,
      progress: task.progress || 0,
      user: task.user,
      check_user: task.check_user,
      group_user: task.group_user,
      note: task.note
    };
    taskData.ma_rnd = this.getMaRnd();
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
    linkData.ma_rnd = this.getMaRnd();
    this.saveLink(linkData);
  }
  updateOrder(id, target) {
    let data = {
      id,
      target
    }
    data.ma_rnd = this.getMaRnd();
    fetch(ISD_BASE_URL + 'gantt/updateTaskOrder', {
      method: 'POST',
      headers: getTokenHeader(),
      body: JSON.stringify(data)
    })
    .then((response) => {
      return response.json()
    }).then((json) => {
      if(json.status == 'error') {
        message.error(json.message, 3);
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
  deleteTask = (id) => {
    if(id) {
      fetch(ISD_BASE_URL + `gantt/delete/${id}`, {
        headers: getTokenHeader()
      })
      .then((response) => response.json())
      .then((json) => {
        if(json.status == 'error') {
          this.props.dispatch(updateStateData({showLogin: true}));
          message.error(json.message, 3);
        } else {
          message.success(json.message);
        }
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra khi xoá quy trình!', 3);
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
          message.error(json.message, 3);
          this.props.dispatch(updateStateData({showLogin: true}));
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
    console.log('clear ganttRnd.ganttEventsInitialized', ganttRnd.ganttEventsInitialized);
    if(ganttRnd.ganttEventsInitialized && mainState && mainState.ganttEvents) {
      mainState.ganttEvents.forEach((event) => {
        ganttRnd.detachEvent(event);
      });
      ganttRnd.ganttEventsInitialized = false;
    }
  }

  initGanttEvents() {
    if(ganttRnd.ganttEventsInitialized){
      return;
    }
    ganttRnd.ganttEventsInitialized = true;
    //Cho tat ca cac su kien vao mainState de co the reset ve sau
    let eventsList = [];
    eventsList.push(
      ganttRnd.attachEvent('onAfterTaskAdd', (id, task) => {
        this.updateTask(id, 'inserted', task);
      })
    );
    eventsList.push(
      ganttRnd.attachEvent('onAfterTaskUpdate', (id, task) => {
        this.updateTask(id, 'updated', task);
      })
    );
    eventsList.push(
      ganttRnd.attachEvent('onAfterTaskDelete', (id) => {
        this.deleteTask(id);
      })
    );
    eventsList.push(
      ganttRnd.attachEvent('onAfterLinkAdd', (id, link) => {
        this.updateLink(id, 'inserted', link);
      })
    );
    eventsList.push(
      ganttRnd.attachEvent('onAfterLinkDelete', (id, link) => {
        this.deleteLink(id);
      })
    );
    eventsList.push(
      ganttRnd.attachEvent("onLightboxSave", function (id, item) {
        if (!item.text) {
          ganttRnd.message({type: "error", text: "Hãy nhập mô tả công việc!"});
          return false;
        }
        // if (!item.user) {
        //   ganttRnd.message({type: "error", text: "Hãy chọn người thực hiện!"});
        //   return false;
        // }
        // if (!item.check_user) {
        //   ganttRnd.message({type: "error", text: "Hãy chọn người phê duyệt!"});
        //   return false;
        // }
        return true;
      })
    );
    eventsList.push(
      ganttRnd.attachEvent("onRowDragEnd", (id, target) => {
        if(!target) return false;
        this.updateOrder(id, target);
        // if (task.$index == 0){
        //     ganttRnd.message("No previous task")
        //     ganttRnd.message("Next task:" + ganttRnd.getTaskByIndex(task.$index + 1).id)
        // } else {
        //     if (isNaN(target+1)){
        //         ganttRnd.message("Previous task:" + ganttRnd.getTaskByIndex(task.$index - 1).id)
        //         ganttRnd.message("No next task")   
        //     }
        //     else {
        //         ganttRnd.message("Previous task:" + ganttRnd.getTaskByIndex(task.$index - 1).id)
        //         ganttRnd.message("Next task:" + ganttRnd.getTaskByIndex(task.$index + 1).id)
        //     }
        // }
      })
    );
    this.props.dispatch(updateStateData({
      ganttEvents: eventsList,
      refreshGantt: false
    }));
  }
  taskClass() {
    ganttRnd.templates.task_class = function (start, end, task) {
      let taskClass = "";
      let percentDone = parseFloat(task.progress) || 0;
      if(percentDone == 0) {
        taskClass += " not_started";
      } else if(percentDone < 0.5) {
        taskClass += " high";
      } else if(percentDone < 0.8) {
        taskClass += " medium";
      } else if(percentDone < 0.9) {
        taskClass += " low";
      } else if(percentDone == 1) {
        taskClass += " task_done";
      }
      taskClass += task.$level == 0 ? " gantt_project" : "";
      return taskClass;
    };
  }
  componentDidMount() {
    let {mainState} = this.props;
    let {ganttData} = mainState;

    ganttRnd.config.fit_tasks = true;
    ganttRnd.config.xml_date = "%Y-%m-%d %H:%i:%s";
    ganttRnd.config.date_grid = "%d-%m-%Y";
    ganttRnd.config.grid_width = 450;
    //Detect Project Level - Level 0
    // ganttRnd.templates.task_class = function (st, end, item) {
    //   return item.$level == 0 ? "gantt_project" : ""
    // };
    // ganttRnd.templates.rightside_text = function (start, end, task) {
    //   return "<span style='text-align:left;'>" + Math.round(task.progress * 100) + "% </span>";
    // };
    ganttRnd.templates.rightside_text = function (start, end, task) {
      let deadline = new Date();
      if (parseFloat(task.progress) < 1 && end < deadline) {
        var overdue = Math.ceil(Math.abs((end.getTime() - deadline.getTime()) / (24 * 60 * 60 * 1000)));
        var text = "<div>Quá hạn: " + overdue + " ngày</div>";
        return text;
      }
    };
    ganttRnd.config.columns = [
      {
        name: "overdue", width: 47, hide: false, template: function (obj) {
          if (obj.end_date) {
            var deadline = ganttRnd.date.parseDate(obj.end_date, "xml_date");
            var today = new Date();
            if (deadline && deadline <= today && parseFloat(obj.progress) < 1) {
              return '<div class="overdue-indicator">!</div>';
            } else {
              return '<div class="doing-progress">'+ Math.round((obj.progress || 0) * 100) +'%</div>';
            }
          }
          return '<div></div>';
        }
      },
      {name: "text", width: 150, hide: false, tree: true},
      {name: "start_date", hide: false, align: "center"},
      {name: "duration", width: 38, hide: false, align: "center"},
      {name: "add", hide: false, align: "center"}
    ];
    //ganttRnd.config.show_grid = true;
    ganttRnd.config.show_links = true;
    //ganttRnd.config.show_progress = true;
    ganttRnd.config.readonly = false;
    ganttRnd.config.drag_move = true;

    //ganttRnd.config.start_date = new Date();
    ganttRnd.config.start_date = ganttRnd.date.day_start(new Date());
    // ganttRnd.templates.progress_text = function (start, end, task) {
    //   return "<span style='text-align:left;'>" + Math.round(task.progress * 100) + "% </span>";
    // };
    //ganttRnd.config.task_date = "%d-%m-%Y";
    //this.initGanttEvents();
    ganttRnd.config.order_branch = true;
    //ganttRnd.config.order_branch_free = true;
    ganttRnd.init(this.ganttContainer);
    this.addControlToLightBox();
    this.taskClass();
    ganttRnd.parse(ganttData);
    this.fetchTasks();
  }
  addControlToLightBox() {
    let {worker_and_users} = this.props.mainState;
    if(worker_and_users) {
      let workers = worker_and_users.workers || [];
      let check_users = worker_and_users.check_users || [];
      let group_users = worker_and_users.group_users || [];

      let workerOptions = [{key: "", label: "Người thực hiện"}];
      workerOptions = workerOptions.concat(workers.map((worker) => {
        return {
          key: worker.id,
          label: worker.ma_ns + ' - ' + worker.name
        }
      }));
      // let checkUserOptions = [{key: "", label: "Người phê duyệt"}];
      // checkUserOptions = checkUserOptions.concat(check_users.map((user) => {
      //   return {
      //     key: user.id,
      //     label: user.ma_ns + ' - ' + (user.name || user.username)
      //   }
      // }));
      let groupUserOptions = [{key: "", label: "Phòng ban"}];
      groupUserOptions = groupUserOptions.concat(group_users.map((group) => {
        return {
          key: group.ma_pb,
          label: group.ma_pb + ' - ' + group.name
        }
      }));
      ganttRnd.config.lightbox.sections = [
        {name: "description", height: 38, map_to: "text", type: "textarea", focus: true},
        //{name: "group_user", height: 25, map_to: "group_user", type: "select", options: groupUserOptions},
        {name: "user", height: 25, map_to: "user", type: "select", options: workerOptions},
        //{name: "check_user", height: 25, map_to: "check_user", type: "select", options: checkUserOptions},
        // {
        //   name: "progress", height: 25, map_to: "progress", type: "select", options: [
        //     {key: 0, label: "Chưa bắt đầu"},
        //     {key: "0.1", label: "10%"},
        //     {key: "0.2", label: "20%"},
        //     {key: "0.3", label: "30%"},
        //     {key: "0.4", label: "40%"},
        //     {key: "0.5", label: "50%"},
        //     {key: "0.6", label: "60%"},
        //     {key: "0.7", label: "70%"},
        //     {key: "0.8", label: "80%"},
        //     {key: "0.9", label: "90%"},
        //     {key: "1", label: "Hoàn thành"}
        //   ]
        // },
        {name: "note", height: 38, map_to: "note", type: "textarea"},
        {name: "time", type: "duration", map_to: "auto"},
      ];
    
      ganttRnd.locale.labels["section_group_user"] = "Phòng ban";
      ganttRnd.locale.labels["section_user"] = "Người thực hiện";
      //ganttRnd.locale.labels["section_check_user"] = "Người phê duyệt";
      ganttRnd.locale.labels["section_progress"] = "Số % hoàn thành";
      ganttRnd.locale.labels["section_note"] = "Ghi chú";
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

export default GanttComponent