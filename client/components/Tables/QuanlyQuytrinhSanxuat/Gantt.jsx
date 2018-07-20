/*global gantt*/
import React, { Component } from 'react';
import 'dhtmlx-gantt';
//import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_tooltip.js';
import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_undo.js';
//import 'dhtmlx-gantt/codebase/locale/locale_ar.js';
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
    this.clearAllEvents = this.clearAllEvents.bind(this);
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
  fetchTasks() {
    this.setState({loading: true});
    let quyTrinhId = this.getQuyTrinhId();
    let fetchUrl = ISD_BASE_URL + 'gantt/fetchTasks/' + quyTrinhId;
    if(this.props.type == "allPlan") {
      fetchUrl = ISD_BASE_URL + 'gantt/allPlan';
    }
    fetch(fetchUrl, {
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
          let ganttTasks = [];
          if(json.data.data) {
            ganttTasks = json.data.data.map((task) => {
              return {
                ...task,
                open: true,//Expand all task
              }
            });
          } 
          let ganttData = {
            links: json.data.links,
            data: ganttTasks
          }
          this.props.dispatch(updateStateData({
            ganttData: ganttData,
          }));
        }
      }
      this.setState({
        loading: false, 
      });
      this.renderGantt();
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu quy trình sản xuất!', 3);
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
    if(nextProps.mainState.quyTrinhSx.edit.id !== prevState.quyTrinhId) {
      return {
        quyTrinhId: nextProps.mainState.quyTrinhSx.edit.id,
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
        this.fetchTasks();
      }
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
        this.fetchTasks();
      }
    }).catch((ex) => {
      this.fetchTasks();
      console.log('parsing failed', ex)
      message.error('Có lỗi xảy ra trong quá trình update link!');
    });
  }
  getQuyTrinhId() {
    return this.props.mainState.quyTrinhSx.edit ? this.props.mainState.quyTrinhSx.edit.id : '';
  }
  updateTask(id, mode, task) {
    let quyTrinhId = this.getQuyTrinhId();
    let taskData = {
      text: task.text,
      start_date: moment(task.start_date).format('YYYY-MM-DD HH:mm:ss'),
      duration: task.duration,
      parent: task.parent,
      progress: task.progress || 0,
      quy_trinh_id: quyTrinhId
    };
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
    if(mainState.quyTrinhSx && mainState.quyTrinhSx.ganttEvents) {
      mainState.quyTrinhSx.ganttEvents.forEach((event) => {
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
    this.props.dispatch(updateStateData({
      quyTrinhSx: {
        ...this.props.mainState.quyTrinhSx,
        ganttEvents: eventsList,
      }
    }));
  }
  componentDidMount() {
    let {mainState} = this.props;
    let {ganttData} = mainState;
    gantt.config.xml_date = "%Y-%m-%d %H:%i:%s";
    gantt.config.date_grid = "%d-%m-%Y";
    
    gantt.config.columns = [
      {name: "text", hide: true},
      {name: "start_date", hide: true},
      {name: "duration", hide: false},
      {name: "add", hide: false}
    ];
    //gantt.config.show_grid = true;
    gantt.config.show_links = true;
    //gantt.config.show_progress = true;
    gantt.config.drag_move = true;
    if(this.props.type == "allPlan") {
      gantt.config.drag_move = false;
      //gantt.config.show_grid = false;
      gantt.config.show_links = false;
      //gantt.config.show_progress = false;
      gantt.config.columns = [
        {name: "text", hide: true},
        {name: "start_date", hide: true},
        {name: "duration", hide: true},
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
    gantt.parse(ganttData);
    this.fetchTasks();
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